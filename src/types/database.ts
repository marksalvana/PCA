// Auto-generated types matching our schema.sql
// Re-generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type UserRole = 'admin' | 'vetter' | 'superadmin' | 'public'
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
export type VettingAction = 'approved' | 'flagged' | 'rejected' | 'requested_correction'
export type PetitionStatus = 'pending' | 'accepted' | 'rejected' | 'already_exists'
export type AchievementCategory =
  | 'legislation' | 'infrastructure' | 'social_program'
  | 'award' | 'international' | 'economic' | 'other'
export type ImpactScope = 'national_landmark' | 'national_standard' | 'national' | 'regional' | 'local'

export interface UserProfile {
  id: string
  display_name: string
  role: UserRole
  bio: string | null
  contribution_count: number
  created_at: string
  updated_at: string
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
    }
  }
}
