import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import ShareInviteModal from '@/components/ShareInviteModal';
import { getCurrentSession } from '@/lib/backend';
import { getShareInvite } from '@/actions/share';

export default async function ShareInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getCurrentSession();

  if (!session) {
    // Depois do login o usuário volta para este mesmo link e vê o modal de confirmação.
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/share/${token}`)}`);
  }

  const invite = await getShareInvite(token);

  if (invite.success && invite.data) {
    if (invite.data.isOwner) redirect('/dashboard');
    if (invite.data.alreadyMember) redirect(`/shared/${invite.data.owner.id}`);
  }

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader active="shared" user={session.user} />
      <main className="max-w-xl mx-auto w-full px-4 sm:px-6 py-10">
        {invite.success && invite.data ? (
          <ShareInviteModal token={token} invite={invite.data} />
        ) : (
          <section className="card p-6 text-center">
            <h1 className="text-lg font-semibold text-fg">
              {invite.status === 404 ? 'Link inválido ou desativado' : 'Não foi possível abrir o link'}
            </h1>
            <p className="text-sm text-muted mt-2">
              {invite.status === 404
                ? 'Este link de compartilhamento não existe mais. Peça um novo link a quem compartilhou.'
                : 'Tente novamente em alguns instantes.'}
            </p>
            <Link href="/dashboard" className="btn btn-accent mt-5 inline-flex">Ir para minha visão geral</Link>
          </section>
        )}
      </main>
    </div>
  );
}
