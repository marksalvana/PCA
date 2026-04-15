import type { LegalRecord } from '@/types/database'
import SourceLink from '@/components/ui/SourceLink'

type Props = {
  record: LegalRecord
  expanded?: boolean
}

const statusLabel: Record<string, string> = {
  pending: 'PENDING',
  convicted: 'CONVICTED',
  acquitted: 'Acquitted',
  dismissed: 'Dismissed',
  ongoing_appeal: 'On Appeal',
}

const statusStyle: Record<string, string> = {
  pending: 'border-amber-500/40 bg-amber-500/5 text-amber-300',
  convicted: 'border-red-500/40 bg-red-500/10 text-red-300',
  acquitted: 'border-green-500/20 bg-green-500/5 text-green-400',
  dismissed: 'border-white/10 bg-white/5 text-gray-400',
  ongoing_appeal: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
}

export default function LegalBadge({ record: r, expanded = false }: Props) {
  const style = statusStyle[r.status] ?? statusStyle.dismissed

  return (
    <div className={`border rounded-xl p-3 ${style}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
              r.status === 'convicted' ? 'bg-red-500/20' :
              r.status === 'pending' ? 'bg-amber-500/20' : 'bg-white/10'
            }`}>
              {statusLabel[r.status] ?? r.status}
            </span>
            <span className="text-xs opacity-70 capitalize">{r.case_type}</span>
          </div>
          <p className="font-semibold mt-1 text-sm">{r.case_title}</p>
          {expanded && (
            <>
              {r.charge && <p className="text-xs opacity-70 mt-1">{r.charge}</p>}
              {r.court && <p className="text-xs opacity-60 mt-0.5">{r.court}</p>}
              {r.filing_date && (
                <p className="text-xs opacity-50 mt-0.5">Filed: {r.filing_date.slice(0, 10)}</p>
              )}
              {r.resolution_summary && (
                <p className="text-xs opacity-70 mt-2 border-t border-current/10 pt-2">
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
