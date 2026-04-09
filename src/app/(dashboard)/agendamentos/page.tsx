import { createClient } from '@/lib/supabase/server'
import { updateAppointmentStatus } from '@/app/actions/appointments'

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  pendente:  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', label: 'Pendente'  },
  confirmado:{ bg: 'rgba(34,197,94,0.12)',   color: '#22c55e', label: 'Confirmado'},
  cancelado: { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'Cancelado' },
  concluido: { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af', label: 'Concluído' },
}

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from('users').select('company_id').eq('id', user?.id ?? '').single()
  const companyId = userData?.company_id

  const params = await searchParams
  let query = supabase
    .from('appointments')
    .select('*, services(name, price), professionals(name)')
    .eq('company_id', companyId ?? '')
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.date)   query = query.eq('date', params.date)

  const { data: appointments } = await query.limit(100)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Agendamentos</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>Gerencie todos os agendamentos da sua empresa.</p>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="date"
          name="date"
          defaultValue={params.date ?? ''}
          className="input"
          style={{ width: 'auto' }}
        />
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="input"
          style={{ width: 'auto' }}
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
          <option value="concluido">Concluído</option>
        </select>
        <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: 14 }}>
          Filtrar
        </button>
        {(params.status || params.date) && (
          <a href="/agendamentos" className="btn-ghost" style={{ padding: '0.6rem 1rem', fontSize: 14 }}>
            Limpar filtros
          </a>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--fg-subtle)', fontWeight: 500 }}>
          {appointments?.length ?? 0} resultado{(appointments?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      </form>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data & Hora', 'Cliente', 'Serviço', 'Profissional', 'Status', 'Pagamento', 'Ações'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(!appointments || appointments.length === 0) ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--fg-subtle)', fontSize: 14 }}>
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              ) : appointments.map((apt: {
                id: string
                date: string
                start_time: string
                client_name: string
                client_phone: string
                services?: { name?: string } | null
                professionals?: { name?: string } | null
                status: string
                payment_method?: string
                payment_status?: string
              }, idx: number) => {
                const svc  = apt.services      && !Array.isArray(apt.services)      ? apt.services      : null
                const prof = apt.professionals && !Array.isArray(apt.professionals) ? apt.professionals : null
                const sc   = statusConfig[apt.status] ?? statusConfig.concluido
                return (
                  <tr key={apt.id} className="table-row-hover" style={{ borderBottom: idx < (appointments?.length ?? 0) - 1 ? '1px solid hsl(222,20%,9%)' : 'none', transition: 'background 0.12s' }}>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
                        {new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginTop: 2 }}>{apt.start_time.slice(0, 5)}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{apt.client_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginTop: 2 }}>{apt.client_phone}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: 'hsl(215,20%,75%)' }}>
                      {svc?.name ?? '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: 'hsl(215,20%,75%)' }}>
                      {prof?.name ?? '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 500 }}>
                        {apt.payment_method === 'online' ? 'Online' : 'Presencial'}
                      </p>
                      <p style={{ fontSize: 12, color: apt.payment_status === 'pago' ? '#22c55e' : '#f59e0b', marginTop: 2, fontWeight: 600 }}>
                        {apt.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                      </p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {apt.status === 'pendente' && (
                          <form action={updateAppointmentStatus.bind(null, apt.id, 'confirmado')}>
                            <button type="submit" style={{ fontSize: 11, fontWeight: 700, padding: '0.3rem 0.625rem', borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.12)', color: '#22c55e', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Confirmar
                            </button>
                          </form>
                        )}
                        {(apt.status === 'pendente' || apt.status === 'confirmado') && (
                          <form action={updateAppointmentStatus.bind(null, apt.id, 'concluido')}>
                            <button type="submit" style={{ fontSize: 11, fontWeight: 700, padding: '0.3rem 0.625rem', borderRadius: 6, border: 'none', background: 'rgba(107,114,128,0.12)', color: '#9ca3af', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Concluir
                            </button>
                          </form>
                        )}
                        {apt.status !== 'cancelado' && apt.status !== 'concluido' && (
                          <form action={updateAppointmentStatus.bind(null, apt.id, 'cancelado')}>
                            <button type="submit" style={{ fontSize: 11, fontWeight: 700, padding: '0.3rem 0.625rem', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Cancelar
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
