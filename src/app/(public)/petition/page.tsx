import PetitionForm from '@/components/PetitionForm'

export const metadata = {
  title: 'Request a Profile — PH Profile Compare',
}

export default function PetitionPage() {
  return (
    <div className="px-4 py-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Request a Profile</h1>
        <p className="text-gray-400">
          Know a politician who should be on this platform? Submit a request and our team will review it.
        </p>
      </div>
      <PetitionForm />
    </div>
  )
}
