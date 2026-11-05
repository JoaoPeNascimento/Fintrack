// Lista e-mails duplicados em `users` (somente leitura).
//
// O backend exige um índice único em users.email e não sobe se ele não puder ser criado. Rode este
// script antes do deploy; se houver duplicados, unifique os dados (cards, gastos, despesas fixas)
// no usuário mantido e remova os demais antes de subir o backend.
//
// Uso: mongosh "$MONGODB_URI" --file check-duplicate-users.js

const dups = db.users.aggregate([
  { $group: { _id: { $toLower: '$email' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } },
]).toArray();

const hasIndex = db.users.getIndexes().some((ix) => ix.unique && ix.key && ix.key.email === 1);
print(`Índice único em users.email: ${hasIndex ? 'presente' : 'AUSENTE'}`);

if (!dups.length) {
  print('Nenhum e-mail duplicado.');
} else {
  print(`${dups.length} e-mail(s) duplicado(s) (comparação sem diferenciar maiúsculas):`);
  dups.forEach((d) => {
    print(`  ${d._id}:`);
    d.ids.forEach((id) => {
      const uid = id.toString();
      const gastos = db.gastos.countDocuments({ userId: id });
      const cards = db.cards.countDocuments({ userId: uid });
      const fixas = db.despesafixas.countDocuments({ userId: id });
      print(`    ${uid}  gastos=${gastos} cards=${cards} despesasFixas=${fixas}`);
    });
  });
}
