import { ProfileForm } from '@/components/auth/profile-form'

export default function ProfilePage() {
  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </div>
  )
}