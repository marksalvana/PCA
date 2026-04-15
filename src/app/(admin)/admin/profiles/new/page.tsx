import PoliticianForm from '@/components/admin/PoliticianForm'

export const metadata = { title: 'New Profile — Admin' }

export default function NewProfilePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black text-white mb-6">Create New Profile</h1>
      <PoliticianForm />
    </div>
  )
}
