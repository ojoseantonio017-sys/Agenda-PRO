import { createClient } from '@/lib/supabase/server'
import { createService, toggleService } from '@/app/actions/services'
import { Plus, Clock, DollarSign, Scissors } from 'lucide-react'

export default async function ServicosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from('users').select('company_id').eq('id', user?.id ?? '').single()
  const companyId = userData?.company_id

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('company_id', companyId ?? '')
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Serviços</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>Gerencie os serviços oferecidos pela sua empresa.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Services list */}
        <div>
          {(!services || services.length === 0) ? (
            <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, background: 'var(--bg-3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Scissors size={24} color="var(--fg-subtle)" />
              </div>
              <p style={{ color: 'var(--fg-muted)', fontSize: 14, fontWeight: 500 }}>Nenhum serviço cadastrado.</p>
              <p style={{ color: 'var(--fg-subtle)', fontSize: 13, marginTop: '0.375rem' }}>Adicione seu primeiro serviço no formulário ao lado.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {services.map((svc: {
                id: string
                name: string
                description?: string
                duration_minutes: number
                price: number
                active: boolean
              }) => (
                <div key={svc.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: svc.active ? 1 : 0.6 }}>
                  <div style={{ width: 44, height: 44, background: svc.active ? 'rgba(255,120,32,0.1)' : 'var(--bg-3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Scissors size={20} color={svc.active ? 'var(--primary)' : 'var(--fg-subtle)'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.01em' }}>{svc.name}</h3>
                      {!svc.active && (
                        <span className="badge" style={{ background: 'rgba(107,114,128,0.15)', color: '#6b7280' }}>Inativo</span>
                      )}
                    </div>
                    {svc.description && (
                      <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 13, color: 'var(--fg-muted)' }}>
                        <Clock size={13} color="var(--fg-subtle)" />
                        {svc.duration_minutes} min
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                        <DollarSign size={13} />
                        R$ {(svc.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <form action={toggleService.bind(null, svc.id, !svc.active)}>
                    <button type="submit" style={{
                      fontSize: 12, fontWeight: 700, padding: '0.4rem 0.875rem', borderRadius: 7, border: 'none',
                      background: svc.active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: svc.active ? '#ef4444' : '#22c55e',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                      {svc.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add form */}
        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
          <h2 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--fg)' }}>
            <div style={{ width: 28, height: 28, background: 'var(--primary-glow)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={16} color="var(--primary)" />
            </div>
            Novo Serviço
          </h2>
          <form action={createService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="hidden" name="company_id" value={companyId ?? ''} />

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>
                Nome do serviço <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input type="text" name="name" placeholder="Ex: Corte de cabelo" required className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>Descrição</label>
              <input type="text" name="description" placeholder="Descrição opcional" className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>
                Duração (minutos) <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input type="number" name="duration_minutes" placeholder="60" required min="1" className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>
                Preço em centavos <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input type="number" name="price" placeholder="Ex: 5000 = R$50,00" required min="0" className="input" />
              <p style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: '0.375rem' }}>5000 centavos = R$ 50,00</p>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: 14, marginTop: '0.25rem' }}>
              Adicionar serviço
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
