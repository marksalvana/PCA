import type { LegalRecord } from '@/types/database'
import SourceLink from '@/components/ui/SourceLink'

type Props = { record: LegalRecord; expanded?: boolean; penalty?: number }

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  pending:        { label: 'PENDING',       bg: 'bg-amber-50',  text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  convicted:      { label: 'CONVICTED',     bg: 'bg-red-50',    text: 'text-red-800',   border: 'border-red-200',   dot: 'bg-red-600' },
  acquitted:      { label: 'Acquitted',     bg: 'bg-green-50',  text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
  dismissed:      { label: 'Dismissed',     bg: 'bg-slate-50',  text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
  ongoing_appeal: { label: 'On Appeal',     bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-400' },
}

const ombudsmanLabel: Record<string, string> = {
  dismissed: 'Ombudsman: Dismissed',
  pending_at_ombudsman: 'Ombudsman: Pending',
  admin_penalty: 'Ombudsman: Admin penalty',
  criminal_filed: 'Ombudsman: Criminal filed',
}

export default function LegalBadge({ record: r, expanded = false, penalty }: Props) {
  const cfg = statusConfig[r.status] ?? statusConfig.dismissed
  const showPenalty = typeof penalty === 'number' && penalty > 0

  return (
    <div className={`border rounded-xl p-3 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot} ${r.status === 'pending' || r.status === 'convicted' ? 'dynasty-badge' : ''}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-black uppercase tracking-wider ${cfg.text}`}>
                {cfg.label}
              </span>
              <span className={`text-xs capitalize opacity-70 ${cfg.text}`}>{r.case_type}</span>
            </div>
            {showPenalty && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-md tabular-nums border shrink-0 ${
                r.is_verified
                  ? 'text-red-600 bg-red-50 border-red-200'
                  : 'text-slate-400 bg-slate-50 border-slate-200'
              }`}>
                −{penalty} pts
              </span>
            )}
          </div>
          <p className={`font-semibold text-sm ${cfg.text}`}>{r.case_title}</p>
          {/* Sourced administrative flags — visible on collapsed and expanded views */}
          {(r.ombudsman_disposition || r.comelec_disqualification) && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {r.ombudsman_disposition && r.ombudsman_disposition !== 'none' && ombudsmanLabel[r.ombudsman_disposition] && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/70 border border-current/30 text-slate-700">
                  {ombudsmanLabel[r.ombudsman_disposition]}
                </span>
              )}
              {r.comelec_disqualification && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/70 border border-red-300 text-red-700">
                  COMELEC disqualification
                </span>
              )}
            </div>
          )}
          {expanded && (
            <>
              {r.charge && <p className={`text-xs mt-1 opacity-80 ${cfg.text}`}>{r.charge}</p>}
              {r.court && <p className={`text-xs opacity-60 mt-0.5 ${cfg.text}`}>{r.court}</p>}
              {r.filing_date && <p className={`text-xs opacity-50 mt-0.5 ${cfg.text}`}>Filed: {r.filing_date.slice(0, 10)}</p>}
              {r.resolution_summary && (
                <p className={`text-xs mt-2 pt-2 border-t opacity-70 ${cfg.text} border-current/10`}>
                  {r.resolution_summary}
                </p>
              )}
              <SourceLink url={r.source_url} label={r.source_label} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
