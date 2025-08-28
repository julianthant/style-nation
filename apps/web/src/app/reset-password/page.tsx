import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function ResetPasswordPage() {
  return (
    <AuthLayout 
      title="Reset password" 
      subtitle="Enter your email address and we'll send you a link to reset your password"
      showHero={false}
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}