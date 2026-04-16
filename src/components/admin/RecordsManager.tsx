'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMutationClient } from '@/lib/supabase/mutations'
import type { PoliticianWithDetails, ChedAccreditation, CoaFinding, LegalCaseType, LegalCaseStatus, AchievementCategory, ImpactScope } from '@/types/database'
import SourceLink from '@/components/ui/SourceLink'
import { computeEducationPts, computeTrackPts, computeAchievementPts, attendanceModifier, LEGAL_PENALTIES } from '@/lib/scoring'

type Tab = 'education' | 'track' | 'legal' | 'achievements'

type Props = { politician: PoliticianWithDetails }

export default function RecordsManager({ politician: p }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('education')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Education form state
  const [eduInstitution, setEduInstitution] = useState('')
  const [eduDegree, setEduDegree] = useState('')
  const [eduField, setEduField] = useState('')
  const [eduYearStart, setEduYearStart] = useState('')
  const [eduYearEnd, setEduYearEnd] = useState('')
  const [eduCompleted, setEduCompleted] = useState(true)
  const [eduAccreditation, setEduAccreditation] = useState<ChedAccreditation>('unknown')
  const [eduSourceUrl, setEduSourceUrl] = useState('')
  const [eduSourceLabel, setEduSourceLabel] = useState('')

  // Track record form state
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

  // Legal form state
  const [legalTitle, setLegalTitle] = useState('')
  const [legalType, setLegalType] = useState<LegalCaseType>('criminal')
  const [legalStatus, setLegalStatus] = useState<LegalCaseStatus>('pending')
  const [legalCourt, setLegalCourt] = useState('')
  const [legalCharge, setLegalCharge] = useState('')
  const [legalFiling, setLegalFiling] = useState('')
  const [legalSourceUrl, setLegalSourceUrl] = useState('')
  const [legalSourceLabel, setLegalSourceLabel] = useState('')

  // Achievement form state
  const [achTitle, setAchTitle] = useState('')
  const [achDesc, setAchDesc] = useState('')
  const [achCategory, setAchCategory] = useState<AchievementCategory>('other')
  const [achImpactScope, setAchImpactScope] = useState<ImpactScope | ''>('')
  const [achYear, setAchYear] = useState('')
  const [achSourceUrl, setAchSourceUrl] = useState('')
  const [achSourceLabel, setAchSourceLabel] = useState('')

  async function saveEducation(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
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
    router.refresh()
  }

  async function saveTrack(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
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
    router.refresh()
  }

  async function saveLegal(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
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
    router.refresh()
  }

  async function saveAchievement(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
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
    setAchTitle(''); setAchDesc(''); setAchImpactScope(''); setAchYear(''); setAchSourceUrl(''); setAchSourceLabel('')
    router.refresh()
  }

  const inputClass = "w-full bg-[#0a0a0f] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-600"
  const labelClass = "block text-xs text-gray-500 mb-1"

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'education', label: 'Education', count: p.education_records?.length ?? 0 },
    { key: 'track', label: 'Track Record', count: p.track_records?.length ?? 0 },
    { key: 'legal', label: 'Legal', count: p.legal_records?.length ?? 0 },
    { key: 'achievements', label: 'Achievements', count: p.achievements?.length ?? 0 },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10 pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[#0038a8] text-white'
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

      {/* Education tab */}
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
            <div>
              <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
              <input type="url" value={eduSourceUrl} onChange={(e) => setEduSourceUrl(e.target.value)} required placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
              <input type="text" value={eduSourceLabel} onChange={(e) => setEduSourceLabel(e.target.value)} required placeholder="UP Official Records" className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#0038a8] hover:bg-[#0038a8]/80 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors mt-1">
              {saving ? 'Saving…' : 'Add Record'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-white text-sm mb-3">Existing Records ({p.education_records?.length ?? 0})</h3>
            <div className="flex flex-col gap-2">
              {p.education_records?.map((r) => {
                const pts = computeEducationPts(r)
                return (
                  <div key={r.id} className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{r.institution}</p>
                        {r.degree && <p className="text-gray-400 text-xs">{r.degree}</p>}
                        {!r.is_completed && <p className="text-amber-500 text-xs">Incomplete (×0.75)</p>}
                        {!r.is_verified && <p className="text-gray-600 text-xs">⏳ pending review</p>}
                        <SourceLink url={r.source_url} label={r.source_label} />
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-xs font-black tabular-nums ${r.is_verified ? 'text-[#60a5fa]' : 'text-gray-500'}`}>
                          +{pts} pts
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {!p.education_records?.length && <p className="text-gray-600 text-sm">No records yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Track record tab */}
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
              <input type="checkbox" checked={trackCurrent} onChange={(e) => setTrackCurrent(e.target.checked)} className="accent-[#0038a8]" />
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
            <p className="text-xs text-gray-500">
              Attendance affects score: ≥90% +20 pts · 75–89% no change · 50–74% −20 pts · &lt;50% −50 pts. Leave blank if unknown.
            </p>
            <div>
              <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
              <input type="url" value={trackSourceUrl} onChange={(e) => setTrackSourceUrl(e.target.value)} required placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
              <input type="text" value={trackSourceLabel} onChange={(e) => setTrackSourceLabel(e.target.value)} required placeholder="COA Annual Audit Report 2023" className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#0038a8] hover:bg-[#0038a8]/80 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors mt-1">
              {saving ? 'Saving…' : 'Add Record'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-white text-sm mb-3">Existing Records ({p.track_records?.length ?? 0})</h3>
            <div className="flex flex-col gap-2">
              {p.track_records?.map((r) => {
                const pts = computeTrackPts(r)
                const attMod = attendanceModifier(r.attendance_rate)
                return (
                  <div key={r.id} className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{r.position}</p>
                        <p className="text-gray-500 text-xs">COA: {r.coa_finding ?? '—'}</p>
                        {r.bills_authored != null && (
                          <p className="text-gray-500 text-xs">{r.bills_authored} authored · {r.bills_passed ?? 0} passed</p>
                        )}
                        {r.attendance_rate != null && (
                          <p className="text-xs">
                            <span className="text-gray-500">Attendance: {r.attendance_rate}% </span>
                            <span className={attMod > 0 ? 'text-green-400' : attMod < 0 ? 'text-red-400' : 'text-gray-600'}>
                              ({attMod > 0 ? '+' : ''}{attMod} pts)
                            </span>
                          </p>
                        )}
                        {!r.is_verified && <p className="text-gray-600 text-xs">⏳ pending review</p>}
                        <SourceLink url={r.source_url} label={r.source_label} />
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-xs font-black tabular-nums ${r.is_verified ? 'text-[#60a5fa]' : 'text-gray-500'}`}>
                          +{pts} pts
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {!p.track_records?.length && <p className="text-gray-600 text-sm">No records yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Legal tab */}
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
              <input type="text" value={legalCharge} onChange={(e) => setLegalCharge(e.target.value)} placeholder="Plunder, Graft and Corruption, etc." className={inputClass} />
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
            <button type="submit" disabled={saving} className="bg-[#0038a8] hover:bg-[#0038a8]/80 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors mt-1">
              {saving ? 'Saving…' : 'Add Record'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-white text-sm mb-3">Existing Records ({p.legal_records?.length ?? 0})</h3>
            <div className="flex flex-col gap-2">
              {p.legal_records?.map((r) => {
                const penalty = LEGAL_PENALTIES[r.status as keyof typeof LEGAL_PENALTIES] ?? 0
                return (
                  <div key={r.id} className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{r.case_title}</p>
                        <p className="text-gray-500 text-xs capitalize">{r.status} · {r.case_type}</p>
                        {!r.is_verified && <p className="text-gray-600 text-xs">⏳ pending review</p>}
                        <SourceLink url={r.source_url} label={r.source_label} />
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-xs font-black tabular-nums ${penalty > 0 ? (r.is_verified ? 'text-red-400' : 'text-gray-500') : 'text-gray-600'}`}>
                          {penalty > 0 ? `−${penalty} pts` : '0 pts'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {!p.legal_records?.length && <p className="text-gray-600 text-sm">No records yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Achievements tab */}
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
              <textarea value={achDesc} onChange={(e) => setAchDesc(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Brief description of the achievement" />
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
              <p className="text-xs text-gray-500 mt-1">Scope determines how this achievement contributes to the objective score.</p>
            </div>
            <div>
              <label className={labelClass}>Source URL <span className="text-red-400">*</span></label>
              <input type="url" value={achSourceUrl} onChange={(e) => setAchSourceUrl(e.target.value)} required placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Source Label <span className="text-red-400">*</span></label>
              <input type="text" value={achSourceLabel} onChange={(e) => setAchSourceLabel(e.target.value)} required placeholder="Senate Official Gazette" className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#0038a8] hover:bg-[#0038a8]/80 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors mt-1">
              {saving ? 'Saving…' : 'Add Achievement'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-white text-sm mb-3">Existing ({p.achievements?.length ?? 0})</h3>
            <div className="flex flex-col gap-2">
              {p.achievements?.map((a) => {
                const pts = computeAchievementPts(a.impact_scope)
                return (
                  <div key={a.id} className="bg-[#111827] border border-white/10 rounded-xl p-3 text-sm">
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
                      <div className="shrink-0 text-right">
                        <span className={`text-xs font-black tabular-nums ${a.is_verified ? 'text-[#60a5fa]' : 'text-gray-500'}`}>
                          +{pts} pts
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {!p.achievements?.length && <p className="text-gray-600 text-sm">No achievements yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
