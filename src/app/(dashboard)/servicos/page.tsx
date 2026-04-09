import { createClient } from '@/lib/supabase/server'
import { createService, toggleService } from '@/app/actions/services'
import { Plus, Clock, DollarSign } from 'lucide-react'

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'hsl(215,20%,92%)', marginBottom: '0.25rem' }}>Serviços</h1>
          <p style={{ color: 'hsl(215,14%,50%)', fontSize: 14 }}>Gerencie os serviços oferecidos pela sua empresa.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Services list */}
        <div>
          {(!services || services.length === 0) ? (
            <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'hsl(215,14%,45%)', fontSize: 14 }}>Nenhum serviço cadastrado ainda. Adicione seu primeiro serviço.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {services.map((svc: {
                id: string
                name: string
                description?: string
                duration_minutes: number
                price: number
                active: boolean
              }) => (
                <div key={svc.id} style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'hsl(215,20%,90%)' }}>{svc.name}</h3>
                      {!svc.active && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'rgba(107,114,128,0.2)', color: '#9ca3af' }}>INATIVO</span>
                      )}
                    </div>
                    {svc.description && (
                      <p style={{ fontSize: 13, color: 'hsl(215,14%,50%)', marginBottom: '0.5rem' }}>{svc.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 13, color: 'hsl(215,14%,55%)' }}>
                        <Clock size={13} />
                        {svc.duration_minutes} min
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 13, color: 'hsl(28,98%,60%)' }}>
                        <DollarSign size={13} />
                        R$ {(svc.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <form action={toggleService.bind(null, svc.id, !svc.active)}>
                    <button
                      type="submit"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '0.4rem 0.875rem',
                        borderRadius: 7,
                        border: 'none',
                        background: svc.active ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                        color: svc.active ? '#ef4444' : '#22c55e',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {svc.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add form */}
        <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.5rem', position: 'sticky', top: '2rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(215,20%,85%)' }}>
            <Plus size={18} color="hsl(28,98%,55%)" />
            Novo Serviço
          </h2>
          <form action={createService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="hidden" name="company_id" value={companyId ?? ''} />
            {[
              { name: 'name', label: 'Nome do serviço', type: 'text', placeholder: 'Ex: Corte de cabelo', required: true },
              { name: 'description', label: 'Descrição', type: 'text', placeholder: 'Descrição opcional' },
              { name: 'duration_minutes', label: 'Duração (minutos)', type: 'number', placeholder: '60', required: true },
              { name: 'price', label: 'Preço (em centavos)', type: 'number', placeholder: '5000 = R$50,00', required: true },
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,65%)', marginBottom: '0.375rem' }}>
                  {field.label} {field.required && <span style={{ color: 'hsl(28,98%,55%)' }}>*</span>}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={{
                    width: '100%',
                    background: 'hsl(224,24%,5%)',
                    border: '1px solid hsl(222,20%,16%)',
                    borderRadius: 7,
                    padding: '0.625rem 0.75rem',
                    color: 'hsl(215,20%,88%)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'hsl(28,98%,55%)',
                color: '#fff',
                padding: '0.7rem',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                marginTop: '0.25rem',
              }}
            >
              Adicionar serviço
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
