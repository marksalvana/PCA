'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMutationClient } from '@/lib/supabase/mutations'
import type {
  PoliticianWithDetails,
  EducationRecord,
  TrackRecord,
  LegalRecord,
  Achievement,
  ChedAccreditation,
  CoaFinding,
  LegalCaseType,
  LegalCaseStatus,
  AchievementCategory,
  ImpactScope,
} from '@/types/database'
import SourceLink from '@/components/ui/SourceLink'
import {
  computeEducationPts,
  computeTrackPts,
  computeAchievementPts,
  attendanceModifier,
  LEGAL_PENALTIES,
} from '@/lib/scoring'

type Tab = 'education' | 'track' | 'legal' | 'achievements'
type Props = { politician: PoliticianWithDetails }

const inputClass =
  'w-full bg-[#0a0a0f] border border-white/10 focus:border-[#1B2A4A] text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-600'
const labelClass = 'block text-xs text-gray-500 mb-1'

// ─── Shared helpers ────────────────────────────────────────────────────────

async function setUnderReview(politicianId: string) {
  const supabase = getMutationClient()
  await supabase
    .from('politicians')
    .update({ status: 'under_review' })
    .eq('id', politicianId)
    .neq('status', 'draft') // don't queue drafts that haven't been published yet
}

async function deleteRecord(
  table: string,
  id: string,
  politicianId: string,
  setSaving: (v: boolean) => void,
  setError: (v: string | null) => void,
  refresh: () => void,
) {
  if (!confirm('Delete this record? This cannot be undone.')) return
  setSaving(true)
  setError(null)
  const supabase = getMutationClient()
  const { error } = await supabase.from(table).delete().eq('id', id)
  setSaving(false)
  if (error) { setError(error.message); return }
  await setUnderReview(politicianId)
  refresh()
}

// ─── Education inline edit form ────────────────────────────────────────────

function EduEditForm({
  record: r,
  onSave,
  onCancel,
}: {
  record: EducationRecord
  onSave: (payload: Partial<EducationRecord>) => void
  onCancel: () => void
}) {
  const [institution, setInstitution] = useState(r.institution)
  const [degree, setDegree] = useState(r.degree ?? '')
  const [field, setField] = useState(r.field_of_study ?? '')
  const [yearStart, setYearStart] = useState(r.year_started ? String(r.year_started) : '')
  const [yearEnd, setYearEnd] = useState(r.year_ended ? String(r.year_ended) : '')
  const [completed, setCompleted] = useState(r.is_completed)
  const [accreditation, setAccreditation] = useState<ChedAccreditation>(r.ched_accreditation ?? 'unknown')
  const [sourceUrl, setSourceUrl] = useState(r.source_url)
  const [sourceLabel, setSourceLabel] = useState(r.source_label)

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    onSave({
      institution,
      degree: degree || null,
      field_of_study: field || null,
      year_started: yearStart ? parseInt(yearStart) : null,
      year_ended: yearEnd ? parseInt(yearEnd) : null,
      is_completed: completed,
      ched_accreditation: accreditation,
      source_url: sourceUrl,
      source_label: sourceLabel,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a2035] border border-[#1B2A4A]/40 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-bold text-[#60a5fa] uppercase tracking-wider">Editing record</p>
      <div>
        <label className={labelClass}>Institution <span className="text-red-400">*</span></label>
        <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} required className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Degree</label>
          <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>CHED Accreditation</label>
          <select value={accreditation} onChange={(e) => setAccreditation(e.target.value as ChedAccreditation)} className={inputClass}>
            <option value="deregulated">Deregulated (+100 pts)</option>
            <option value="autonomous">Autonomous (+95 pts)</option>
            <option value="foreign">Foreign (+90 pts)</option>
            <option value="level_4">Level IV (+85 pts)</option>
            <option value="level_3">Level III (+70 pts)</option>
            <option value="level_2">Level II (+55 pts)</option>
            <option value="level_1">Level I (+40 pts)</option>
            <option value="unaccredited">Unaccredited (+20 pts)</option>
            <option value="unknown">Unknown (+0 pts)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Field of Study</label>
          <input type="text" value={field} onChange={(e) => setField(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} className="accent-[#1B2A4A]" />
            Completed
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Year Started</label>
          <input type="number" value={yearStart} onChange={(e) => setYearStart(e.target.value)} placeholder="1990" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Year Ended</label>
          <input type="number" value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} placeholder="1994" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
        <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
        <input type="text" value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} required className={inputClass} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-colors">Save</button>
        <button type="button" onClick={onCancel} className="border border-white/10 text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm transition-colors">Cancel</button>
      </div>
    </form>
  )
}

// ─── Track record inline edit form ────────────────────────────────────────

function TrackEditForm({
  record: r,
  onSave,
  onCancel,
}: {
  record: TrackRecord
  onSave: (payload: Partial<TrackRecord>) => void
  onCancel: () => void
}) {
  const [position, setPosition] = useState(r.position)
  const [start, setStart] = useState(r.start_date ?? '')
  const [end, setEnd] = useState(r.end_date ?? '')
  const [isCurrent, setIsCurrent] = useState(r.is_current)
  const [coa, setCoa] = useState<CoaFinding>(r.coa_finding ?? 'unknown')
  const [billsAuthored, setBillsAuthored] = useState(r.bills_authored != null ? String(r.bills_authored) : '')
  const [billsPassed, setBillsPassed] = useState(r.bills_passed != null ? String(r.bills_passed) : '')
  const [attendance, setAttendance] = useState(r.attendance_rate != null ? String(r.attendance_rate) : '')
  const [notes, setNotes] = useState(r.notes ?? '')
  const [sourceUrl, setSourceUrl] = useState(r.source_url)
  const [sourceLabel, setSourceLabel] = useState(r.source_label)

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    onSave({
      position,
      start_date: start || null,
      end_date: end || null,
      is_current: isCurrent,
      coa_finding: coa,
      bills_authored: billsAuthored ? parseInt(billsAuthored) : null,
      bills_passed: billsPassed ? parseInt(billsPassed) : null,
      attendance_rate: attendance ? parseFloat(attendance) : null,
      notes: notes || null,
      source_url: sourceUrl,
      source_label: sourceLabel,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a2035] border border-[#1B2A4A]/40 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-bold text-[#60a5fa] uppercase tracking-wider">Editing record</p>
      <div>
        <label className={labelClass}>Position <span className="text-red-400">*</span></label>
        <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} required className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} disabled={isCurrent} className={inputClass} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="accent-[#1B2A4A]" />
        Currently in this position
      </label>
      <div>
        <label className={labelClass}>COA Audit Finding</label>
        <select value={coa} onChange={(e) => setCoa(e.target.value as CoaFinding)} className={inputClass}>
          <option value="unqualified">Unqualified / Clean (+100 pts)</option>
          <option value="qualified">Qualified (+60 pts)</option>
          <option value="adverse">Adverse (+20 pts)</option>
          <option value="disclaimer">Disclaimer (+10 pts)</option>
          <option value="not_applicable">Not Applicable (bills-based)</option>
          <option value="unknown">Unknown (+0 pts)</option>
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={labelClass}>Bills Authored</label>
          <input type="number" value={billsAuthored} onChange={(e) => setBillsAuthored(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bills Passed</label>
          <input type="number" value={billsPassed} onChange={(e) => setBillsPassed(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Attendance %</label>
          <input type="number" min="0" max="100" step="0.1" value={attendance} onChange={(e) => setAttendance(e.target.value)} placeholder="95" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
        <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
        <input type="text" value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} required className={inputClass} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-colors">Save</button>
        <button type="button" onClick={onCancel} className="border border-white/10 text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm transition-colors">Cancel</button>
      </div>
    </form>
  )
}

// ─── Legal inline edit form ─────────────────────────────────────────────────

function LegalEditForm({
  record: r,
  onSave,
  onCancel,
}: {
  record: LegalRecord
  onSave: (payload: Partial<LegalRecord>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(r.case_title)
  const [type, setType] = useState<LegalCaseType>(r.case_type)
  const [status, setStatus] = useState<LegalCaseStatus>(r.status)
  const [court, setCourt] = useState(r.court ?? '')
  const [charge, setCharge] = useState(r.charge ?? '')
  const [filing, setFiling] = useState(r.filing_date ?? '')
  const [resolution, setResolution] = useState(r.resolution_date ?? '')
  const [resolutionSummary, setResolutionSummary] = useState(r.resolution_summary ?? '')
  const [sourceUrl, setSourceUrl] = useState(r.source_url)
  const [sourceLabel, setSourceLabel] = useState(r.source_label)

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    onSave({
      case_title: title,
      case_type: type,
      status,
      court: court || null,
      charge: charge || null,
      filing_date: filing || null,
      resolution_date: resolution || null,
      resolution_summary: resolutionSummary || null,
      source_url: sourceUrl,
      source_label: sourceLabel,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a2035] border border-[#1B2A4A]/40 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-bold text-[#60a5fa] uppercase tracking-wider">Editing record</p>
      <div>
        <label className={labelClass}>Case Title <span className="text-red-400">*</span></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Case Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as LegalCaseType)} className={inputClass}>
            <option value="criminal">Criminal</option>
            <option value="civil">Civil</option>
            <option value="administrative">Administrative</option>
            <option value="electoral">Electoral</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as LegalCaseStatus)} className={inputClass}>
            <option value="pending">Pending</option>
            <option value="convicted">Convicted</option>
            <option value="acquitted">Acquitted</option>
            <option value="dismissed">Dismissed</option>
            <option value="ongoing_appeal">Ongoing Appeal</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Charge</label>
        <input type="text" value={charge} onChange={(e) => setCharge(e.target.value)} placeholder="Plunder, Graft and Corruption…" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Court</label>
          <input type="text" value={court} onChange={(e) => setCourt(e.target.value)} placeholder="Sandiganbayan" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Filing Date</label>
          <input type="date" value={filing} onChange={(e) => setFiling(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Resolution Date</label>
          <input type="date" value={resolution} onChange={(e) => setResolution(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Resolution Summary</label>
        <textarea value={resolutionSummary} onChange={(e) => setResolutionSummary(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
        <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
        <input type="text" value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} required className={inputClass} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-colors">Save</button>
        <button type="button" onClick={onCancel} className="border border-white/10 text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm transition-colors">Cancel</button>
      </div>
    </form>
  )
}

// ─── Achievement inline edit form ──────────────────────────────────────────

function AchEditForm({
  record: a,
  onSave,
  onCancel,
}: {
  record: Achievement
  onSave: (payload: Partial<Achievement>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(a.title)
  const [desc, setDesc] = useState(a.description ?? '')
  const [category, setCategory] = useState<AchievementCategory>(a.category ?? 'other')
  const [scope, setScope] = useState<ImpactScope | ''>(a.impact_scope ?? '')
  const [year, setYear] = useState(a.year ? String(a.year) : '')
  const [sourceUrl, setSourceUrl] = useState(a.source_url)
  const [sourceLabel, setSourceLabel] = useState(a.source_label)

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    onSave({
      title,
      description: desc || null,
      category,
      impact_scope: scope || null,
      year: year ? parseInt(year) : null,
      source_url: sourceUrl,
      source_label: sourceLabel,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a2035] border border-[#1B2A4A]/40 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-bold text-[#60a5fa] uppercase tracking-wider">Editing record</p>
      <div>
        <label className={labelClass}>Title <span className="text-red-400">*</span></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as AchievementCategory)} className={inputClass}>
            <option value="legislation">Legislation</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="social_program">Social Program</option>
            <option value="award">Award</option>
            <option value="international">International</option>
            <option value="economic">Economic</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2022" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Impact Scope <span className="text-red-400">*</span></label>
        <select value={scope} onChange={(e) => setScope(e.target.value as ImpactScope | '')} required className={inputClass}>
          <option value="">— Select scope —</option>
          <option value="national_landmark">National — Landmark (+100 pts)</option>
          <option value="national_standard">National — Standard (+60 pts)</option>
          <option value="regional">Regional (+40 pts)</option>
          <option value="local">Local (+20 pts)</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
        <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
        <input type="text" value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} required className={inputClass} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-colors">Save</button>
        <button type="button" onClick={onCancel} className="border border-white/10 text-gray-400 hover:text-white px-4 py-1.5 rounded-lg text-sm transition-colors">Cancel</button>
      </div>
    </form>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function RecordsManager({ politician: p }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('education')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = () => { setEditingId(null); router.refresh() }

  // ── Add form state ───────────────────────────────────────────────────────

  const [eduInstitution, setEduInstitution] = useState('')
  const [eduDegree, setEduDegree] = useState('')
  const [eduField, setEduField] = useState('')
  const [eduYearStart, setEduYearStart] = useState('')
  const [eduYearEnd, setEduYearEnd] = useState('')
  const [eduCompleted, setEduCompleted] = useState(true)
  const [eduAccreditation, setEduAccreditation] = useState<ChedAccreditation>('unknown')
  const [eduSourceUrl, setEduSourceUrl] = useState('')
  const [eduSourceLabel, setEduSourceLabel] = useState('')

  const [trackPosition, setTrackPosition] = useState('')
  const [trackStart, setTrackStart] = useState('')
  const [trackEnd, setTrackEnd] = useState('')
  const [trackCurrent, setTrackCurrent] = useState(false)
  const [trackCoa, setTrackCoa] = useState<CoaFinding>('unknown')
  const [trackBillsAuthored, setTrackBillsAuthored] = useState('')
  const [trackBillsPassed, setTrackBillsPassed] = useState('')
  const [trackAttendance, setTrackAttendance] = useState('')
  const [trackSourceUrl, setTrackSourceUrl] = useState('')
  const [trackSourceLabel, setTrackSourceLabel] = useState('')

  const [legalTitle, setLegalTitle] = useState('')
  const [legalType, setLegalType] = useState<LegalCaseType>('criminal')
  const [legalStatus, setLegalStatus] = useState<LegalCaseStatus>('pending')
  const [legalCourt, setLegalCourt] = useState('')
  const [legalCharge, setLegalCharge] = useState('')
  const [legalFiling, setLegalFiling] = useState('')
  const [legalSourceUrl, setLegalSourceUrl] = useState('')
  const [legalSourceLabel, setLegalSourceLabel] = useState('')

  const [achTitle, setAchTitle] = useState('')
  const [achDesc, setAchDesc] = useState('')
  const [achCategory, setAchCategory] = useState<AchievementCategory>('other')
  const [achImpactScope, setAchImpactScope] = useState<ImpactScope | ''>('')
  const [achYear, setAchYear] = useState('')
  const [achSourceUrl, setAchSourceUrl] = useState('')
  const [achSourceLabel, setAchSourceLabel] = useState('')

  // ── Save / update helpers ────────────────────────────────────────────────

  async function saveEducation(e: React.SyntheticEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const supabase = getMutationClient()
    const { error } = await supabase.from('education_records').insert({
      politician_id: p.id,
      institution: eduInstitution,
      degree: eduDegree || null,
      field_of_study: eduField || null,
      year_started: eduYearStart ? parseInt(eduYearStart) : null,
      year_ended: eduYearEnd ? parseInt(eduYearEnd) : null,
      is_completed: eduCompleted,
      ched_accreditation: eduAccreditation,
      source_url: eduSourceUrl,
      source_label: eduSourceLabel,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setEduInstitution(''); setEduDegree(''); setEduField('')
    setEduYearStart(''); setEduYearEnd(''); setEduSourceUrl(''); setEduSourceLabel('')
    await setUnderReview(p.id)
    refresh()
  }

  async function updateEducation(id: string, payload: Partial<EducationRecord>) {
    setSaving(true); setError(null)
    const supabase = getMutationClient()
    const { error } = await supabase.from('education_records').update(payload).eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return }
    await setUnderReview(p.id)
    refresh()
  }

  async function saveTrack(e: React.SyntheticEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const supabase = getMutationClient()
    const { error } = await supabase.from('track_records').insert({
      politician_id: p.id,
      position: trackPosition,
      start_date: trackStart || null,
      end_date: trackEnd || null,
      is_current: trackCurrent,
      coa_finding: trackCoa,
      bills_authored: trackBillsAuthored ? parseInt(trackBillsAuthored) : null,
      bills_passed: trackBillsPassed ? parseInt(trackBillsPassed) : null,
      attendance_rate: trackAttendance ? parseFloat(trackAttendance) : null,
      source_url: trackSourceUrl,
      source_label: trackSourceLabel,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setTrackPosition(''); setTrackStart(''); setTrackEnd('')
    setTrackBillsAuthored(''); setTrackBillsPassed(''); setTrackAttendance('')
    setTrackSourceUrl(''); setTrackSourceLabel('')
    await setUnderReview(p.id)
    refresh()
  }

  async function updateTrack(id: string, payload: Partial<TrackRecord>) {
    setSaving(true); setError(null)
    const supabase = getMutationClient()
    const { error } = await supabase.from('track_records').update(payload).eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return }
    await setUnderReview(p.id)
    refresh()
  }

  async function saveLegal(e: React.SyntheticEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const supabase = getMutationClient()
    const { error } = await supabase.from('legal_records').insert({
      politician_id: p.id,
      case_title: legalTitle,
      case_type: legalType,
      status: legalStatus,
      court: legalCourt || null,
      charge: legalCharge || null,
      filing_date: legalFiling || null,
      source_url: legalSourceUrl,
      source_label: legalSourceLabel,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setLegalTitle(''); setLegalCourt(''); setLegalCharge(''); setLegalFiling('')
    setLegalSourceUrl(''); setLegalSourceLabel('')
    await setUnderReview(p.id)
    refresh()
  }

  async function updateLegal(id: string, payload: Partial<LegalRecord>) {
    setSaving(true); setError(null)
    const supabase = getMutationClient()
    const { error } = await supabase.from('legal_records').update(payload).eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return }
    await setUnderReview(p.id)
    refresh()
  }

  async function saveAchievement(e: React.SyntheticEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const supabase = getMutationClient()
    const { error } = await supabase.from('achievements').insert({
      politician_id: p.id,
      title: achTitle,
      description: achDesc || null,
      category: achCategory,
      impact_scope: achImpactScope || null,
      year: achYear ? parseInt(achYear) : null,
      source_url: achSourceUrl,
      source_label: achSourceLabel,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setAchTitle(''); setAchDesc(''); setAchImpactScope(''); setAchYear('')
    setAchSourceUrl(''); setAchSourceLabel('')
    await setUnderReview(p.id)
    refresh()
  }

  async function updateAchievement(id: string, payload: Partial<Achievement>) {
    setSaving(true); setError(null)
    const supabase = getMutationClient()
    const { error } = await supabase.from('achievements').update(payload).eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return }
    await setUnderReview(p.id)
    refresh()
  }

  // ── Record action buttons ────────────────────────────────────────────────

  function RecordActions({ id, table }: { id: string; table: string }) {
    return (
      <div className="flex gap-1.5 mt-2">
        <button
          onClick={() => setEditingId(editingId === id ? null : id)}
          className="text-xs text-[#60a5fa] hover:text-white border border-[#1B2A4A]/40 hover:border-[#1B2A4A] px-2.5 py-1 rounded-md transition-colors"
        >
          {editingId === id ? 'Cancel' : 'Edit'}
        </button>
        <button
          onClick={() => deleteRecord(table, id, p.id, setSaving, setError, refresh)}
          disabled={saving}
          className="text-xs text-red-400 hover:text-white border border-red-500/20 hover:border-red-500/60 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'education',    label: 'Education',    count: p.education_records?.length ?? 0 },
    { key: 'track',        label: 'Track Record', count: p.track_records?.length ?? 0 },
    { key: 'legal',        label: 'Legal',        count: p.legal_records?.length ?? 0 },
    { key: 'achievements', label: 'Achievements', count: p.achievements?.length ?? 0 },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setEditingId(null) }}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[#1B2A4A] text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-2 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* ── Education ── */}
      {tab === 'education' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={saveEducation} className="bg-[#111827] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="font-bold text-white text-sm">Add Education Record</h3>
            <div>
              <label className={labelClass}>Institution <span className="text-red-400">*</span></label>
              <input type="text" value={eduInstitution} onChange={(e) => setEduInstitution(e.target.value)} required placeholder="University of the Philippines" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Degree</label>
                <input type="text" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} placeholder="B.S. Political Science" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>CHED Accreditation</label>
                <select value={eduAccreditation} onChange={(e) => setEduAccreditation(e.target.value as ChedAccreditation)} className={inputClass}>
                  <option value="deregulated">Deregulated (+100 pts)</option>
                  <option value="autonomous">Autonomous (+95 pts)</option>
                  <option value="foreign">Foreign (+90 pts)</option>
                  <option value="level_4">Level IV (+85 pts)</option>
                  <option value="level_3">Level III (+70 pts)</option>
                  <option value="level_2">Level II (+55 pts)</option>
                  <option value="level_1">Level I (+40 pts)</option>
                  <option value="unaccredited">Unaccredited (+20 pts)</option>
                  <option value="unknown">Unknown (+0 pts)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Year Started</label>
                <input type="number" value={eduYearStart} onChange={(e) => setEduYearStart(e.target.value)} placeholder="1990" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Year Ended</label>
                <input type="number" value={eduYearEnd} onChange={(e) => setEduYearEnd(e.target.value)} placeholder="1994" className={inputClass} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={eduCompleted} onChange={(e) => setEduCompleted(e.target.checked)} className="accent-[#1B2A4A]" />
              Degree completed
            </label>
            <div>
              <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
              <input type="url" value={eduSourceUrl} onChange={(e) => setEduSourceUrl(e.target.value)} required placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
              <input type="text" value={eduSourceLabel} onChange={(e) => setEduSourceLabel(e.target.value)} required placeholder="UP Official Records" className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors mt-1">
              {saving ? 'Saving…' : 'Add Record'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-white text-sm mb-3">Existing Records ({p.education_records?.length ?? 0})</h3>
            <div className="flex flex-col gap-2">
              {p.education_records?.map((r) => (
                <div key={r.id}>
                  {editingId === r.id ? (
                    <EduEditForm
                      record={r}
                      onSave={(payload) => updateEducation(r.id, payload)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">{r.institution}</p>
                          {r.degree && <p className="text-gray-400 text-xs">{r.degree}{r.field_of_study ? ` — ${r.field_of_study}` : ''}</p>}
                          {r.ched_accreditation && r.ched_accreditation !== 'unknown' && (
                            <p className="text-xs text-gray-500">{r.ched_accreditation}</p>
                          )}
                          {!r.is_completed && <p className="text-amber-500 text-xs">Incomplete (×0.75)</p>}
                          {!r.is_verified && <p className="text-gray-600 text-xs">⏳ pending review</p>}
                          <SourceLink url={r.source_url} label={r.source_label} />
                        </div>
                        <span className={`text-xs font-black tabular-nums shrink-0 ${r.is_verified ? 'text-[#60a5fa]' : 'text-gray-500'}`}>
                          +{computeEducationPts(r)} pts
                        </span>
                      </div>
                      <RecordActions id={r.id} table="education_records" />
                    </div>
                  )}
                </div>
              ))}
              {!p.education_records?.length && <p className="text-gray-600 text-sm">No records yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Track Record ── */}
      {tab === 'track' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={saveTrack} className="bg-[#111827] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="font-bold text-white text-sm">Add Track Record</h3>
            <div>
              <label className={labelClass}>Position <span className="text-red-400">*</span></label>
              <input type="text" value={trackPosition} onChange={(e) => setTrackPosition(e.target.value)} required placeholder="Senator" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={trackStart} onChange={(e) => setTrackStart(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={trackEnd} onChange={(e) => setTrackEnd(e.target.value)} disabled={trackCurrent} className={inputClass} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={trackCurrent} onChange={(e) => setTrackCurrent(e.target.checked)} className="accent-[#1B2A4A]" />
              Currently in this position
            </label>
            <div>
              <label className={labelClass}>COA Audit Finding</label>
              <select value={trackCoa} onChange={(e) => setTrackCoa(e.target.value as CoaFinding)} className={inputClass}>
                <option value="unqualified">Unqualified / Clean (+100 pts)</option>
                <option value="qualified">Qualified (+60 pts)</option>
                <option value="adverse">Adverse (+20 pts)</option>
                <option value="disclaimer">Disclaimer (+10 pts)</option>
                <option value="not_applicable">Not Applicable (bills-based)</option>
                <option value="unknown">Unknown (+0 pts)</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelClass}>Bills Authored</label>
                <input type="number" value={trackBillsAuthored} onChange={(e) => setTrackBillsAuthored(e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bills Passed</label>
                <input type="number" value={trackBillsPassed} onChange={(e) => setTrackBillsPassed(e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Attendance %</label>
                <input type="number" min="0" max="100" step="0.1" value={trackAttendance} onChange={(e) => setTrackAttendance(e.target.value)} placeholder="95" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
              <input type="url" value={trackSourceUrl} onChange={(e) => setTrackSourceUrl(e.target.value)} required placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
              <input type="text" value={trackSourceLabel} onChange={(e) => setTrackSourceLabel(e.target.value)} required placeholder="COA Annual Audit Report 2023" className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors mt-1">
              {saving ? 'Saving…' : 'Add Record'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-white text-sm mb-3">Existing Records ({p.track_records?.length ?? 0})</h3>
            <div className="flex flex-col gap-2">
              {p.track_records?.map((r) => (
                <div key={r.id}>
                  {editingId === r.id ? (
                    <TrackEditForm
                      record={r}
                      onSave={(payload) => updateTrack(r.id, payload)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">{r.position}</p>
                          <p className="text-gray-500 text-xs">COA: {r.coa_finding ?? '—'}</p>
                          {r.bills_authored != null && (
                            <p className="text-gray-500 text-xs">{r.bills_authored} authored · {r.bills_passed ?? 0} passed</p>
                          )}
                          {r.attendance_rate != null && (() => {
                            const mod = attendanceModifier(r.attendance_rate)
                            return (
                              <p className="text-xs">
                                <span className="text-gray-500">Attendance: {r.attendance_rate}% </span>
                                <span className={mod > 0 ? 'text-green-400' : mod < 0 ? 'text-red-400' : 'text-gray-600'}>
                                  ({mod > 0 ? '+' : ''}{mod} pts)
                                </span>
                              </p>
                            )
                          })()}
                          {!r.is_verified && <p className="text-gray-600 text-xs">⏳ pending review</p>}
                          <SourceLink url={r.source_url} label={r.source_label} />
                        </div>
                        <span className={`text-xs font-black tabular-nums shrink-0 ${r.is_verified ? 'text-[#60a5fa]' : 'text-gray-500'}`}>
                          +{computeTrackPts(r)} pts
                        </span>
                      </div>
                      <RecordActions id={r.id} table="track_records" />
                    </div>
                  )}
                </div>
              ))}
              {!p.track_records?.length && <p className="text-gray-600 text-sm">No records yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Legal ── */}
      {tab === 'legal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={saveLegal} className="bg-[#111827] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="font-bold text-white text-sm">Add Legal Record</h3>
            <div>
              <label className={labelClass}>Case Title <span className="text-red-400">*</span></label>
              <input type="text" value={legalTitle} onChange={(e) => setLegalTitle(e.target.value)} required placeholder="People of the Philippines vs. ..." className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Case Type</label>
                <select value={legalType} onChange={(e) => setLegalType(e.target.value as LegalCaseType)} className={inputClass}>
                  <option value="criminal">Criminal</option>
                  <option value="civil">Civil</option>
                  <option value="administrative">Administrative</option>
                  <option value="electoral">Electoral</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={legalStatus} onChange={(e) => setLegalStatus(e.target.value as LegalCaseStatus)} className={inputClass}>
                  <option value="pending">Pending</option>
                  <option value="convicted">Convicted</option>
                  <option value="acquitted">Acquitted</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="ongoing_appeal">Ongoing Appeal</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Charge</label>
              <input type="text" value={legalCharge} onChange={(e) => setLegalCharge(e.target.value)} placeholder="Plunder, Graft and Corruption…" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Court</label>
                <input type="text" value={legalCourt} onChange={(e) => setLegalCourt(e.target.value)} placeholder="Sandiganbayan" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Filing Date</label>
                <input type="date" value={legalFiling} onChange={(e) => setLegalFiling(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
              <input type="url" value={legalSourceUrl} onChange={(e) => setLegalSourceUrl(e.target.value)} required placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
              <input type="text" value={legalSourceLabel} onChange={(e) => setLegalSourceLabel(e.target.value)} required placeholder="Sandiganbayan Decision" className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors mt-1">
              {saving ? 'Saving…' : 'Add Record'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-white text-sm mb-3">Existing Records ({p.legal_records?.length ?? 0})</h3>
            <div className="flex flex-col gap-2">
              {p.legal_records?.map((r) => {
                const penalty = LEGAL_PENALTIES[r.status as keyof typeof LEGAL_PENALTIES] ?? 0
                return (
                  <div key={r.id}>
                    {editingId === r.id ? (
                      <LegalEditForm
                        record={r}
                        onSave={(payload) => updateLegal(r.id, payload)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white">{r.case_title}</p>
                            <p className="text-gray-500 text-xs capitalize">{r.status} · {r.case_type}</p>
                            {r.charge && <p className="text-gray-500 text-xs">{r.charge}</p>}
                            {!r.is_verified && <p className="text-gray-600 text-xs">⏳ pending review</p>}
                            <SourceLink url={r.source_url} label={r.source_label} />
                          </div>
                          <span className={`text-xs font-black tabular-nums shrink-0 ${penalty > 0 ? (r.is_verified ? 'text-red-400' : 'text-gray-500') : 'text-gray-600'}`}>
                            {penalty > 0 ? `−${penalty} pts` : '0 pts'}
                          </span>
                        </div>
                        <RecordActions id={r.id} table="legal_records" />
                      </div>
                    )}
                  </div>
                )
              })}
              {!p.legal_records?.length && <p className="text-gray-600 text-sm">No records yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Achievements ── */}
      {tab === 'achievements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={saveAchievement} className="bg-[#111827] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="font-bold text-white text-sm">Add Achievement</h3>
            <div>
              <label className={labelClass}>Title <span className="text-red-400">*</span></label>
              <input type="text" value={achTitle} onChange={(e) => setAchTitle(e.target.value)} required placeholder="Authored the Anti-Terror Act" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={achDesc} onChange={(e) => setAchDesc(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Category</label>
                <select value={achCategory} onChange={(e) => setAchCategory(e.target.value as AchievementCategory)} className={inputClass}>
                  <option value="legislation">Legislation</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="social_program">Social Program</option>
                  <option value="award">Award</option>
                  <option value="international">International</option>
                  <option value="economic">Economic</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Year</label>
                <input type="number" value={achYear} onChange={(e) => setAchYear(e.target.value)} placeholder="2022" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Impact Scope <span className="text-red-400">*</span></label>
              <select value={achImpactScope} onChange={(e) => setAchImpactScope(e.target.value as ImpactScope | '')} required className={inputClass}>
                <option value="">— Select scope —</option>
                <option value="national_landmark">National — Landmark (+100 pts)</option>
                <option value="national_standard">National — Standard (+60 pts)</option>
                <option value="regional">Regional (+40 pts)</option>
                <option value="local">Local (+20 pts)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
              <input type="url" value={achSourceUrl} onChange={(e) => setAchSourceUrl(e.target.value)} required placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
              <input type="text" value={achSourceLabel} onChange={(e) => setAchSourceLabel(e.target.value)} required placeholder="Senate Official Gazette" className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/80 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors mt-1">
              {saving ? 'Saving…' : 'Add Achievement'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-white text-sm mb-3">Existing ({p.achievements?.length ?? 0})</h3>
            <div className="flex flex-col gap-2">
              {p.achievements?.map((a) => (
                <div key={a.id}>
                  {editingId === a.id ? (
                    <AchEditForm
                      record={a}
                      onSave={(payload) => updateAchievement(a.id, payload)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">{a.title}</p>
                          {a.year && <p className="text-gray-500 text-xs">{a.year}</p>}
                          {a.impact_scope ? (
                            <p className="text-xs text-indigo-400 capitalize mt-0.5">{a.impact_scope}</p>
                          ) : (
                            <p className="text-xs text-amber-500 mt-0.5">⚠ Set impact scope</p>
                          )}
                          {!a.is_verified && <p className="text-gray-600 text-xs">⏳ pending review</p>}
                          <SourceLink url={a.source_url} label={a.source_label} />
                        </div>
                        <span className={`text-xs font-black tabular-nums shrink-0 ${a.is_verified ? 'text-[#60a5fa]' : 'text-gray-500'}`}>
                          +{computeAchievementPts(a.impact_scope)} pts
                        </span>
                      </div>
                      <RecordActions id={a.id} table="achievements" />
                    </div>
                  )}
                </div>
              ))}
              {!p.achievements?.length && <p className="text-gray-600 text-sm">No achievements yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
