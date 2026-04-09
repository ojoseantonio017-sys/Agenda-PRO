import { login } from '@/app/actions/auth'
import { Calendar } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left panel - decorative */}
      <div style={{ flex: 1, display: 'none', background: 'linear-gradient(135deg, hsl(222,24%,6%) 0%, hsl(224,24%,4%) 100%)', borderRight: '1px solid var(--border)', padding: '3rem', flexDirection: 'column', justifyContent: 'space-between', minWidth: 380 }} className="login-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 34, height: 34, background: 'var(--primary)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#fff', boxShadow: '0 4px 12px rgba(255,120,32,0.3)' }}>A</div>
          <span style={{ fontWeight: 800, fontSize: 17 }}>AgendaPRO</span>
        </div>
        <div>
          <blockquote style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.7, color: 'hsl(215,20%,80%)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            &ldquo;Depois do AgendaPRO, não perco mais tempo com ligações. Meus clientes agendam sozinhos e eu foco no que sei fazer.&rdquo;
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,120,32,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>M</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg)' }}>Maria Silva</p>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Studio MS · São Paulo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.125rem', boxShadow: '0 8px 24px rgba(255,120,32,0.25)' }}>
              <Calendar size={26} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>Entrar no AgendaPRO</h1>
            <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>Acesse seu painel de agendamentos</p>
          </div>

          {/* Card */}
          <div className="card" style={{ padding: '2rem', borderColor: 'var(--border-2)' }}>
            <ErrorMessage searchParams={searchParams} />

            <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,70%)', marginBottom: '0.5rem' }}>Email</label>
                <input type="email" name="email" required placeholder="seu@email.com" className="input" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,70%)' }}>Senha</label>
                  <a href="#" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Esqueci a senha</a>
                </div>
                <input type="password" name="password" required placeholder="••••••••" className="input" />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: 15, marginTop: '0.25rem' }}>
                Entrar
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--fg-muted)', fontSize: 13.5 }}>
            Ainda não tem conta?{' '}
            <a href="/landing#precos" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Contratar um plano
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

async function ErrorMessage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams
  if (!params.error && !params.message) return null
  return (
    <div style={{
      background: params.error ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
      border: `1px solid ${params.error ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
      borderRadius: 8,
      padding: '0.75rem 1rem',
      fontSize: 13.5,
      color: params.error ? '#f87171' : '#86efac',
      marginBottom: '1.25rem',
      lineHeight: 1.5,
    }}>
      {params.error || params.message}
    </div>
  )
}
