import Link from 'next/link'
import AuthForm from '@/components/AuthForm'
import MagicBackground from '@/components/MagicBackground'

export default function RegisterPage() {
  return (
    <>
      <MagicBackground />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Tomorrowmanyers
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Crea tu cuenta</h1>
            <p className="text-neutral-400">Comienza a organizar eventos increíbles</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl p-8">
            <AuthForm mode="register" />

            <div className="mt-6 text-center">
              <p className="text-neutral-400">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}