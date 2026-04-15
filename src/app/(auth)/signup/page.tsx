import SignupForm from '@/components/auth/SignupForm'

export const metadata = { title: 'Create Account — PH Profile Compare' }

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">For vetters and contributors only</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
