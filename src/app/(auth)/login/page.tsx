import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'

export const metadata = { title: 'Sign In — PH Profile Compare' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">Sign In</h1>
          <p className="text-gray-400 text-sm mt-1">Admin and vetter access only</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
