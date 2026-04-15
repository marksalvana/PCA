'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMutationClient } from '@/lib/supabase/mutations'
import type { Politician } from '@/types/database'

type Props = { politician?: Politician }

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function PoliticianForm({ politician }: Props) {
  const router = useRouter()
  const isEdit = !!politician

  const [fullName, setFullName] = useState(politician?.full_name ?? '')
  const [preferredName, setPreferredName] = useState(politician?.preferred_name ?? '')
  const [currentPosition, setCurrentPosition] = useState(politician?.current_position ?? '')
  const [partyAffiliation, setPartyAffiliation] = useState(politician?.party_affiliation ?? '')
  const [region, setRegion] = useState(politician?.region ?? '')
  const [birthDate, setBirthDate] = useState(politician?.birth_date ?? '')
  const [photoUrl, setPhotoUrl] = useState(politician?.photo_url ?? '')
  const [isIncumbent, setIsIncumbent] = useState(politician?.is_incumbent ?? false)
  const [isCandidate, setIsCandidate] = useState(politician?.is_candidate ?? false)
  const [status, setStatus] = useState<Politician['status']>(politician?.status ?? 'draft')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = getMutationClient()
    const slug = politician?.slug ?? slugify(fullName)

    const payload = {
      full_name: fullName,
      preferred_name: preferredName || null,
      slug,
      current_position: currentPosition || null,
      party_affiliation: partyAffiliation || null,
      region: region || null,
      birth_date: birthDate || null,
      photo_url: photoUrl || null,
      is_incumbent: isIncumbent,
      is_candidate: isCandidate,
      status,
    }

    const { data, error } = isEdit
      ? await supabase.from('politicians').update(payload).eq('id', politician!.id).select().single<Politician>()
      : await supabase.from('politicians').insert(payload).select().single<Politician>()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/admin/profiles/${(data as Politician).id}/records`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Juan de la Cruz"
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Preferred Name</label>
          <input
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder="Nickname or shortened name"
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Birth Date</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">Current Position</label>
          <input
            type="text"
            value={currentPosition}
            onChange={(e) => setCurrentPosition(e.target.value)}
            placeholder="e.g. Senator, Representative for Manila 1st District"
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Party Affiliation</label>
          <input
            type="text"
            value={partyAffiliation}
            onChange={(e) => setPartyAffiliation(e.target.value)}
            placeholder="e.g. PDP-Laban"
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Region</label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. NCR, Davao Region"
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">Photo URL</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-600"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isIncumbent}
            onChange={(e) => setIsIncumbent(e.target.checked)}
            className="accent-[#0038a8]"
          />
          Currently incumbent
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isCandidate}
            onChange={(e) => setIsCandidate(e.target.checked)}
            className="accent-[#0038a8]"
          />
          Active candidate
        </label>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Politician['status'])}
          className="bg-[#111827] border border-white/10 focus:border-[#0038a8] text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
        >
          <option value="draft">Draft</option>
          <option value="under_review">Under Review</option>
          <option value="published">Published</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#0038a8] hover:bg-[#0038a8]/80 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create & Add Records →'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-white/10 text-gray-400 hover:text-white px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
