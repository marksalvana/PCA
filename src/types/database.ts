// Auto-generated types matching our schema.sql
// Re-generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

/**
 * Roles in priority order:
 *   admin/superadmin — full backend access
 *   vetter           — backend access; verifies records
 *   contributor      — backend access; submits records and adds politiko profiles
 *   member           — frontend only; can post/rate/submit petitions
 *
 * 'public' is a legacy default that migration 020 migrates to 'member'.
 * Kept in the type for backward compatibility while old rows clear out.
 */
export type UserRole = 'admin' | 'superadmin' | 'vetter' | 'contributor' | 'member' | 'public'

/** Roles that have backend (admin app) access. */
export const BACKEND_ROLES: UserRole[] = ['admin', 'superadmin', 'vetter', 'contributor']

export function isBackendRole(role: UserRole | null | undefined): boolean {
  return !!role && (BACKEND_ROLES as string[]).includes(role)
}

export type NotificationType =
  | 'submission_accepted'
  | 'submission_rejected'
  | 'submission_under_review'
  | 'contributor_app_approved'
  | 'contributor_app_rejected'
  | 'vetter_app_approved'
  | 'vetter_app_rejected'
  | 'record_verified'
  | 'record_flagged'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  link_url: string | null
  read_at: string | null
  created_at: string
}

export interface ContributorApplication {
  id: string
  full_name: string
  email: string
  background: string
  motivation: string
  profile_url: string | null
  public_display_consent: boolean
  applicant_user_id: string | null
  status: 'pending' | 'accepted' | 'rejected'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}
export type PoliticianStatus = 'draft' | 'under_review' | 'published' | 'flagged'
export type ChedAccreditation =
  | 'level_1' | 'level_2' | 'level_3' | 'level_4'
  | 'autonomous' | 'deregulated' | 'unaccredited' | 'foreign' | 'unknown'
export type CoaFinding =
  | 'unqualified' | 'qualified' | 'adverse' | 'disclaimer'
  | 'not_applicable' | 'unknown'
export type LegalCaseType = 'criminal' | 'civil' | 'administrative' | 'electoral'
export type LegalCaseStatus =
  | 'pending' | 'convicted' | 'acquitted' | 'dismissed' | 'ongoing_appeal'
/**
 * Severity tier of a conviction sentence per PH penal classification.
 * Used to compute the conviction penalty (see compute_objective_score
 * in migration 023). Required when status='convicted'; ignored otherwise.
 * Default fallback for legacy convicted rows with NULL category is 'mayor'.
 */
export type SentenceCategory =
  | 'civil'         // Civil judgment / contempt order, no PH imprisonment
  | 'arresto'       // Arresto menor / mayor (1 day – 6 months)
  | 'correccional'  // Prisión correccional (6 months – 6 years)
  | 'mayor'         // Prisión mayor (6 – 12 years)
  | 'temporal'      // Reclusión temporal (12 – 20 years)
  | 'perpetua'      // Reclusión perpetua / life
export type VettingAction = 'approved' | 'flagged' | 'rejected' | 'requested_correction'
export type PetitionStatus = 'pending' | 'accepted' | 'rejected' | 'already_exists'
export type AchievementCategory =
  | 'legislation' | 'infrastructure' | 'social_program'
  | 'award' | 'international' | 'economic' | 'other'
export type ImpactScope = 'national_landmark' | 'national_standard' | 'national' | 'regional' | 'local'
export type OmbudsmanDisposition =
  | 'dismissed' | 'admin_penalty' | 'criminal_filed' | 'pending_at_ombudsman' | 'none'

export interface UserProfile {
  id: string
  display_name: string
  role: UserRole
  bio: string | null
  contribution_count: number
  phone_verified: boolean
  phone_e164: string | null
  created_at: string
  updated_at: string
}

export interface ScoreBreakdown {
  edu: number
  edu_max: number
  track: number
  track_max: number
  achievement: number
  achievement_max: number
  awards: number
  awards_max: number
  legal_pending: number
  legal_conviction: number
  legal_other: number
  saln_penalty: number
  computed_at: string
}

export interface Politician {
  id: string
  slug: string
  full_name: string
  preferred_name: string | null
  photo_url: string | null
  birth_date: string | null
  birth_place: string | null
  current_position: string | null
  party_affiliation: string | null
  region: string | null
  is_incumbent: boolean
  is_candidate: boolean
  status: PoliticianStatus
  objective_score: number | null
  score_breakdown: ScoreBreakdown | null
  civic_trust_score: number | null
  dynasty_name: string | null
  dynasty_generation: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DynastyConnection {
  id: string
  politician_id: string
  related_name: string
  relationship: string
  position_held: string | null
  is_current: boolean
  in_dataset: boolean
  related_slug: string | null
  source_url: string
  source_label: string
  created_at: string
}

export interface EducationRecord {
  id: string
  politician_id: string
  institution: string
  degree: string | null
  field_of_study: string | null
  year_started: number | null
  year_ended: number | null
  is_completed: boolean
  ched_accreditation: ChedAccreditation | null
  institution_score: number | null
  source_url: string
  source_label: string
  created_by: string | null
  is_verified: boolean
  created_at: string
}

export interface TrackRecord {
  id: string
  politician_id: string
  position: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
  coa_finding: CoaFinding | null
  attendance_rate: number | null
  bills_authored: number | null
  bills_passed: number | null
  bills_enacted_count: number | null
  // Unscored legislative output counters (migration 025) — biographical only
  co_authored_bills: number | null
  resolutions_authored: number | null
  co_authored_resolutions: number | null
  sglg_awarded: boolean | null
  performance_score: number | null
  notes: string | null
  source_url: string
  source_label: string
  created_by: string | null
  is_verified: boolean
  created_at: string
}

export interface LegalRecord {
  id: string
  politician_id: string
  case_title: string
  case_type: LegalCaseType
  status: LegalCaseStatus
  court: string | null
  charge: string | null
  filing_date: string | null
  resolution_date: string | null
  resolution_summary: string | null
  ombudsman_disposition: OmbudsmanDisposition | null
  comelec_disqualification: boolean | null
  sentence_category: SentenceCategory | null
  source_url: string
  source_label: string
  created_by: string | null
  is_verified: boolean
  created_at: string
}

export interface Achievement {
  id: string
  politician_id: string
  title: string
  description: string | null
  category: AchievementCategory | null
  year: number | null
  impact_scope: ImpactScope | null
  source_url: string
  source_label: string
  created_by: string | null
  is_verified: boolean
  created_at: string
}

export interface NetWorthRecord {
  id: string
  politician_id: string
  year: number
  declared_net_worth: number | null
  assets: number | null
  liabilities: number | null
  declared_income: number | null
  saln_filed_on_time: boolean | null
  source_url: string
  source_label: string
  created_by: string | null
  is_verified: boolean
  created_at: string
}

export interface Award {
  id: string
  politician_id: string
  name: string
  issuing_body: string
  year: number | null
  citation_text: string | null
  source_url: string
  source_label: string
  created_by: string | null
  is_verified: boolean
  created_at: string
}

export type SubmissionType = 'education' | 'track_record' | 'achievement'
export type SubmissionStatus =
  | 'pending' | 'under_review' | 'accepted' | 'rejected' | 'duplicate'

export interface RecordSubmissionPayload {
  // Common fields any submission_type may have populated
  // Education
  institution?: string
  degree?: string
  field_of_study?: string
  year_started?: number
  year_ended?: number
  is_completed?: boolean
  ched_accreditation?: ChedAccreditation
  // Track record
  position?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
  coa_finding?: CoaFinding
  bills_authored?: number
  bills_passed?: number
  bills_enacted_count?: number
  sglg_awarded?: boolean
  attendance_rate?: number
  // Achievement
  title?: string
  description?: string
  impact_scope?: ImpactScope
  category?: AchievementCategory
  year?: number
}

export interface RecordSubmission {
  id: string
  politician_id: string
  submission_type: SubmissionType
  payload: RecordSubmissionPayload
  source_url: string
  source_label: string
  supporting_document_url: string | null
  explanation: string
  submitter_name: string
  submitter_email: string
  submitter_user_id: string | null
  status: SubmissionStatus
  admin_notes: string | null
  reviewed_by: string | null
  created_at: string
  resolved_at: string | null
}

export interface OutcomeMetric {
  id: string
  politician_id: string
  jurisdiction: string
  metric: string
  baseline_value: number | null
  baseline_year: number | null
  end_value: number | null
  end_year: number | null
  source_url: string
  source_label: string
  created_by: string | null
  is_verified: boolean
  created_at: string
}

export interface VettingRecord {
  id: string
  politician_id: string
  vetter_id: string
  action: VettingAction
  notes: string | null
  education_record_id: string | null
  track_record_id: string | null
  legal_record_id: string | null
  achievement_id: string | null
  vetted_at: string
}

export interface CivicTrustRating {
  id: string
  politician_id: string
  user_id: string
  rating: number
  created_at: string
}

export interface Petition {
  id: string
  politician_name: string
  current_position: string | null
  reason: string | null
  requested_by: string | null
  requester_email: string | null
  status: PetitionStatus
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
}

export type ForumCategory = 'suggestion' | 'feedback' | 'question' | 'bug_report' | 'general'

export interface ForumPost {
  id: string
  author_name: string
  content: string
  category: ForumCategory
  user_id: string | null
  is_pinned: boolean
  created_at: string
}

export type ReactionType = 'like' | 'dislike'

export interface ForumReaction {
  id: string
  post_id: string
  user_id: string
  reaction: ReactionType
  created_at: string
}

export interface ForumReply {
  id: string
  post_id: string
  parent_reply_id: string | null
  depth: number  // 0, 1, or 2 (enforced by DB CHECK)
  user_id: string | null
  author_name: string
  content: string
  created_at: string
}

export interface ForumReplyReaction {
  id: string
  reply_id: string
  user_id: string
  reaction: ReactionType
  created_at: string
}

export interface ScoringBenchmark {
  id: string
  category: string
  key: string
  score: number
  label: string
  description: string | null
}

// Joined types for profile display
export interface PoliticianWithDetails extends Politician {
  education_records: EducationRecord[]
  track_records: TrackRecord[]
  legal_records: LegalRecord[]
  achievements: Achievement[]
  net_worth_records: NetWorthRecord[]
  awards?: Award[]
  outcome_metrics?: OutcomeMetric[]
  dynasty_connections: DynastyConnection[]
  creator: UserProfile | null
  vetters: UserProfile[]
}

// Mutable insert/update types — exclude server-generated fields
type Insertable<T extends { id: string; created_at: string }> = Omit<T, 'id' | 'created_at'>
type Updatable<T extends { id: string; created_at: string }> = Partial<Omit<T, 'id' | 'created_at'>>

// Database type for Supabase client typing
export interface Database {
  public: {
    Tables: {
      user_profiles: { Row: UserProfile; Insert: Insertable<UserProfile>; Update: Updatable<UserProfile> }
      politicians: { Row: Politician; Insert: Insertable<Politician & { updated_at: string }>; Update: Updatable<Politician & { updated_at: string }> }
      education_records: { Row: EducationRecord; Insert: Insertable<EducationRecord>; Update: Updatable<EducationRecord> }
      track_records: { Row: TrackRecord; Insert: Insertable<TrackRecord>; Update: Updatable<TrackRecord> }
      legal_records: { Row: LegalRecord; Insert: Insertable<LegalRecord>; Update: Updatable<LegalRecord> }
      achievements: { Row: Achievement; Insert: Insertable<Achievement>; Update: Updatable<Achievement> }
      net_worth_records: { Row: NetWorthRecord; Insert: Insertable<NetWorthRecord>; Update: Updatable<NetWorthRecord> }
      awards: { Row: Award; Insert: Insertable<Award>; Update: Updatable<Award> }
      outcome_metrics: { Row: OutcomeMetric; Insert: Insertable<OutcomeMetric>; Update: Updatable<OutcomeMetric> }
      record_submissions: { Row: RecordSubmission; Insert: Insertable<RecordSubmission>; Update: Updatable<RecordSubmission> }
      notifications: { Row: Notification; Insert: Insertable<Notification>; Update: Updatable<Notification> }
      contributor_applications: { Row: ContributorApplication; Insert: Insertable<ContributorApplication>; Update: Updatable<ContributorApplication> }
      vetting_records: { Row: VettingRecord; Insert: Omit<VettingRecord, 'id' | 'vetted_at'>; Update: Partial<Omit<VettingRecord, 'id' | 'vetted_at'>> }
      civic_trust_ratings: { Row: CivicTrustRating; Insert: Omit<CivicTrustRating, 'id' | 'created_at'>; Update: Partial<Omit<CivicTrustRating, 'id' | 'created_at'>> }
      petitions: { Row: Petition; Insert: Omit<Petition, 'id' | 'created_at'>; Update: Partial<Omit<Petition, 'id' | 'created_at'>> }
      scoring_benchmarks: { Row: ScoringBenchmark; Insert: Omit<ScoringBenchmark, 'id'>; Update: Partial<Omit<ScoringBenchmark, 'id'>> }
      dynasty_connections: { Row: DynastyConnection; Insert: Omit<DynastyConnection, 'id' | 'created_at'>; Update: Partial<Omit<DynastyConnection, 'id' | 'created_at'>> }
      forum_posts: {
        Row: ForumPost
        Insert: { author_name: string; content: string; category?: ForumCategory; user_id?: string | null; is_pinned?: boolean }
        Update: { author_name?: string; content?: string; category?: ForumCategory; user_id?: string | null; is_pinned?: boolean }
      }
      forum_reactions: {
        Row: ForumReaction
        Insert: { post_id: string; user_id: string; reaction: ReactionType }
        Update: { reaction?: ReactionType }
      }
      forum_replies: {
        Row: ForumReply
        Insert: { post_id: string; parent_reply_id?: string | null; depth: number; user_id?: string | null; author_name: string; content: string }
        Update: { content?: string }
      }
      forum_reply_reactions: {
        Row: ForumReplyReaction
        Insert: { reply_id: string; user_id: string; reaction: ReactionType }
        Update: { reaction?: ReactionType }
      }
    }
  }
}
