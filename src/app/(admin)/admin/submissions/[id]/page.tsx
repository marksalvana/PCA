import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubmissionReview from '@/components/admin/SubmissionReview'
import type { Politician, RecordSubmission } from '@/types/database'

export const metadata = { title: 'Review submission — Admin' }

type SubmissionWithPolitician = RecordSubmission & {
  politician: Pick<Politician, 'id' | 'slug' | 'full_name' | 'preferred_name'> | null
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'vetter', 'superadmin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const { data: submission } = await supabase
    .from('record_submissions')
    .select('*, politician:politicians!politician_id(id, slug, full_name, preferred_name)')
    .eq('id', id)
    .maybeSingle<SubmissionWithPolitician>()

  if (!submission) notFound()

  // Look up the reviewer name if already resolved
  let reviewerName: string | null = null
  if (submission.reviewed_by) {
    const { data: reviewer } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', submission.reviewed_by)
      .maybeSingle<{ display_name: string }>()
    reviewerName = reviewer?.display_name ?? null
  }

  return <SubmissionReview submission={submission} reviewerName={reviewerName} />
}
