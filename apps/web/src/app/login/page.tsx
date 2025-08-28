import { LoginForm } from '@/components/auth/login-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your Style Nation account to continue"
    >
      <LoginForm />
    </AuthLayout>
  )
}