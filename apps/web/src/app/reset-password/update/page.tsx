import { UpdatePasswordForm } from '@/components/auth/update-password-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function UpdatePasswordPage() {
  return (
    <AuthLayout 
      title="Set new password" 
      subtitle="Enter your new password below. Make sure it's strong and secure."
      showHero={false}
    >
      <UpdatePasswordForm />
    </AuthLayout>
  )
}