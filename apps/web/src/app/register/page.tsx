import { RegisterForm } from '@/components/auth/register-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Create account" 
      subtitle="Join Style Nation and discover exceptional vehicles with unmatched quality"
    >
      <RegisterForm />
    </AuthLayout>
  )
}