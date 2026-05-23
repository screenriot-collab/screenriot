import { redirect } from 'next/navigation';

/** Legacy URL — filmmaker preview + redline edits live on /preview */
export default async function ContributeRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/films/${id}/preview`);
}
