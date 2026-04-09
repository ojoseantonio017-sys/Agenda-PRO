import { CheckCircle, Calendar } from 'lucide-react'

const planNames: Record<string, string> = {
  basico: 'Básico',
  profissional: 'Profissional',
  empresarial: 'Empresarial',
}

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const params = await searchParams
  const planName = planNames[params.plan ?? ''] ?? 'selecionado'

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(224,24%,3.5%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>
        {/* Icon */}
        <div style={{ width: 80, height: 80, background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <CheckCircle size={42} color="#4ade80" />
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'hsl(215,20%,92%)', marginBottom: '1rem' }}>
          Pagamento confirmado!
        </h1>
        <p style={{ color: 'hsl(215,14%,55%)', fontSize: 16, lineHeight: 1.7, marginBottom: '2rem' }}>
          Seu plano <strong style={{ color: 'hsl(28,98%,55%)' }}>{planName}</strong> foi ativado com sucesso.
          Você receberá um email com as credenciais de acesso em breve.
        </p>

        <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: '1rem', color: 'hsl(215,20%,85%)' }}>
            Próximos passos
          </h2>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
            {[
              'Acesse sua conta com as credenciais enviadas por email',
              'Configure os serviços e horários dos profissionais',
              'Compartilhe sua página pública com seus clientes',
              'Comece a receber agendamentos online!',
            ].map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: 14, color: 'hsl(215,14%,65%)' }}>
                <span style={{ width: 22, height: 22, background: 'hsl(28,98%,55%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <a
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'hsl(28,98%,55%)',
            color: '#fff',
            padding: '0.875rem 2rem',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          <Calendar size={18} />
          Acessar minha conta
        </a>

        <p style={{ marginTop: '1rem', color: 'hsl(215,14%,40%)', fontSize: 12 }}>
          Dúvidas? Entre em contato: suporte@agendapro.com.br
        </p>
      </div>
    </div>
  )
}
