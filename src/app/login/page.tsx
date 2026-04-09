import { login } from '@/app/actions/auth'
import { Calendar } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'hsl(224,24%,3.5%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 52, height: 52, background: 'hsl(28,98%,55%)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Calendar size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'hsl(215,20%,92%)', marginBottom: '0.25rem' }}>AgendaPRO</h1>
          <p style={{ color: 'hsl(215,14%,50%)', fontSize: 14 }}>Entre na sua conta</p>
        </div>

        {/* Card */}
        <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 14, padding: '2rem' }}>
          <ErrorMessage searchParams={searchParams} />

          <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,75%)', marginBottom: '0.5rem' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  background: 'hsl(224,24%,5%)',
                  border: '1px solid hsl(222,20%,16%)',
                  borderRadius: 8,
                  padding: '0.7rem 0.875rem',
                  color: 'hsl(215,20%,92%)',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,75%)', marginBottom: '0.5rem' }}>
                Senha
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'hsl(224,24%,5%)',
                  border: '1px solid hsl(222,20%,16%)',
                  borderRadius: 8,
                  padding: '0.7rem 0.875rem',
                  color: 'hsl(215,20%,92%)',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'hsl(28,98%,55%)',
                color: '#fff',
                padding: '0.8rem',
                borderRadius: 9,
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                marginTop: '0.25rem',
              }}
            >
              Entrar
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="#" style={{ color: 'hsl(28,98%,55%)', fontSize: 13, textDecoration: 'none' }}>
              Esqueci minha senha
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'hsl(215,14%,45%)', fontSize: 13 }}>
          Ainda não tem conta?{' '}
          <a href="/landing#precos" style={{ color: 'hsl(28,98%,55%)', textDecoration: 'none', fontWeight: 600 }}>
            Contratar um plano
          </a>
        </p>
      </div>
    </div>
  )
}

async function ErrorMessage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams
  if (!params.error && !params.message) return null
  return (
    <div style={{
      background: params.error ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      border: `1px solid ${params.error ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
      borderRadius: 8,
      padding: '0.75rem 1rem',
      fontSize: 13,
      color: params.error ? '#f87171' : '#86efac',
      marginBottom: '1.25rem',
    }}>
      {params.error || params.message}
    </div>
  )
}
