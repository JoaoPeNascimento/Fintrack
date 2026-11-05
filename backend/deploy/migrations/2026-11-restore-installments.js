// Restaura o número TOTAL de parcelas em `gastos`.
//
// Contexto: o antigo cron da Vercel (/api/cron/update-installments, "0 0 1 * *") rodava no dia 1º de
// cada mês um `updateMany({ installments: { $gt: 1 } }, { $inc: { installments: -1 } })` em TODOS os
// gastos, sem olhar a data da compra. O backend passou a tratar `installments` como total imutável
// (ActiveExpensePolicy), então os valores decrementados escondem parcelas ainda não pagas.
//
// Reconstrução: total = armazenado + nº de execuções do cron ocorridas depois do createdAt do gasto.
// Só é exato enquanto o valor armazenado for > 1: o cron parava em 1, então gastos com
// installments == 1 que passaram por execuções são AMBÍGUOS (à vista ou parcelamento já esgotado)
// e não são alterados, apenas listados para revisão manual.
//
// PRÉ-REQUISITO: o cron precisa estar DESLIGADO antes de rodar com APPLY=1 (remova o cron no painel
// da Vercel ou faça o deploy sem o vercel.json). Se ele rodar de novo depois da migração, os totais
// voltam a ser decrementados.
//
// Uso (dry-run por padrão, não grava nada):
//   CRON_LAST_RUN=2026-11-01 mongosh "$MONGODB_URI" --file 2026-11-restore-installments.js
// Aplicar:
//   APPLY=1 CRON_LAST_RUN=2026-11-01 mongosh "$MONGODB_URI" --file 2026-11-restore-installments.js
//
// Variáveis:
//   CRON_FIRST_RUN  1ª execução do cron em produção (yyyy-MM-dd, dia 1). Padrão: 2026-04-01
//                   (o cron foi commitado em 2026-03-16). Confirme nos logs de cron da Vercel.
//   CRON_LAST_RUN   Última execução do cron em produção (yyyy-MM-dd, dia 1). Obrigatória.
//   APPLY           "1" para gravar.

const MIGRATION_ID = 'restore-installments-v1';
const APPLY = process.env.APPLY === '1';

function parseFirstOfMonth(name, value) {
  if (!value || !/^\d{4}-\d{2}-01$/.test(value)) {
    throw new Error(`${name} deve ser o dia 1º de um mês no formato yyyy-MM-01 (recebido: ${value})`);
  }
  return new Date(`${value}T00:00:00Z`);
}

const firstRun = parseFirstOfMonth('CRON_FIRST_RUN', process.env.CRON_FIRST_RUN || '2026-04-01');
const lastRun = parseFirstOfMonth('CRON_LAST_RUN', process.env.CRON_LAST_RUN);
if (lastRun < firstRun) {
  throw new Error('CRON_LAST_RUN é anterior a CRON_FIRST_RUN');
}

const cronRuns = [];
for (let d = new Date(firstRun); d <= lastRun; d.setUTCMonth(d.getUTCMonth() + 1)) {
  cronRuns.push(new Date(d));
}

// A Vercel dispara crons dentro da hora agendada (00:00–00:59 UTC); gastos criados nessa janela
// podem ou não ter sido decrementados naquela execução.
const CRON_WINDOW_MS = 60 * 60 * 1000;

const already = db.migrations.findOne({ _id: MIGRATION_ID });
if (already && APPLY) {
  throw new Error(`Migração ${MIGRATION_ID} já aplicada em ${already.appliedAt.toISOString()}; abortando.`);
}

print(`Migração ${MIGRATION_ID} — ${APPLY ? 'APLICANDO' : 'DRY-RUN (nada será gravado)'}`);
print(`Execuções do cron consideradas: ${cronRuns.length} (${firstRun.toISOString().slice(0, 10)} → ${lastRun.toISOString().slice(0, 10)})`);

function createdAtOf(doc) {
  if (doc.createdAt instanceof Date) return doc.createdAt;
  if (doc._id && typeof doc._id.getTimestamp === 'function') return doc._id.getTimestamp();
  return null;
}

const stats = { scanned: 0, restored: 0, unchanged: 0, ambiguous: [], borderline: [], noDate: [] };
const ops = [];

db.gastos.find({ installmentsMigration: { $exists: false } }).forEach((doc) => {
  stats.scanned++;
  const createdAt = createdAtOf(doc);
  if (!createdAt) {
    stats.noDate.push(doc._id);
    return;
  }

  const runs = cronRuns.filter((run) => run > createdAt).length;
  const stored = typeof doc.installments === 'number' && doc.installments >= 1 ? doc.installments : 1;

  if (cronRuns.some((run) => createdAt >= run && createdAt - run < CRON_WINDOW_MS)) {
    stats.borderline.push({ _id: doc._id, name: doc.name, createdAt, stored });
  }

  if (runs === 0) {
    stats.unchanged++;
    return;
  }
  if (stored === 1) {
    stats.ambiguous.push({ _id: doc._id, name: doc.name, payment: doc.payment_method, date: doc.date, createdAt, runs });
    return;
  }

  const restored = stored + runs;
  stats.restored++;
  if (stats.restored <= 20) {
    print(`  ${doc._id} "${doc.name}": ${stored} → ${restored} (compra ${doc.date && doc.date.toISOString().slice(0, 10)}, ${runs} execuções)`);
  }
  ops.push({
    updateOne: {
      // Só grava se o documento não mudou desde a leitura.
      filter: { _id: doc._id, installments: doc.installments, installmentsMigration: { $exists: false } },
      update: {
        $set: {
          installments: restored,
          installmentsMigration: { id: MIGRATION_ID, storedBefore: stored, cronRuns: runs, migratedAt: new Date() },
        },
      },
    },
  });
});

if (stats.restored > 20) print(`  ... e mais ${stats.restored - 20}`);
print(`\nLidos: ${stats.scanned} | a restaurar: ${stats.restored} | sem execuções após a criação: ${stats.unchanged}`);
print(`Ambíguos (installments == 1 após execuções; NÃO alterados): ${stats.ambiguous.length}`);
stats.ambiguous
  .filter((a) => a.payment === 'CARTAO')
  .forEach((a) => print(`  [revisar] ${a._id} "${a.name}" (CARTAO, compra ${a.date && a.date.toISOString().slice(0, 10)}, até ${a.runs + 1}x)`));
if (stats.borderline.length) {
  print(`Criados dentro da janela de execução do cron (podem estar com 1 a mais): ${stats.borderline.length}`);
  stats.borderline.forEach((b) => print(`  [revisar] ${b._id} "${b.name}" criado em ${b.createdAt.toISOString()}`));
}
if (stats.noDate.length) print(`Sem createdAt nem ObjectId (ignorados): ${stats.noDate.join(', ')}`);

if (!APPLY) {
  print('\nDry-run concluído. Rode com APPLY=1 para gravar.');
} else {
  let modified = 0;
  for (let i = 0; i < ops.length; i += 500) {
    modified += db.gastos.bulkWrite(ops.slice(i, i + 500), { ordered: false }).modifiedCount;
  }
  db.migrations.insertOne({
    _id: MIGRATION_ID,
    appliedAt: new Date(),
    cronFirstRun: firstRun,
    cronLastRun: lastRun,
    restored: modified,
    ambiguous: stats.ambiguous.map((a) => a._id),
  });
  print(`\nAplicado: ${modified} de ${ops.length} documentos atualizados.`);
  if (modified !== ops.length) print('ATENÇÃO: alguns documentos mudaram durante a migração; rode o dry-run de novo para conferir.');
}
