import { createClient } from '@/lib/supabase/server'
import { updateAppointmentStatus } from '@/app/actions/appointments'

const statusColors: Record<string, { bg: string; color: string }> = {
  pendente: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  confirmado: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  cancelado: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  concluido: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  concluido: 'Concluído',
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
  if (params.date) query = query.eq('date', params.date)

  const { data: appointments } = await query.limit(100)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'hsl(215,20%,92%)', marginBottom: '0.25rem' }}>Agendamentos</h1>
          <p style={{ color: 'hsl(215,14%,50%)', fontSize: 14 }}>Gerencie todos os agendamentos da sua empresa.</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="date"
          name="date"
          defaultValue={params.date ?? ''}
          style={{ background: 'hsl(222,20%,9%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'hsl(215,20%,80%)', fontSize: 14 }}
        />
        <select
          name="status"
          defaultValue={params.status ?? ''}
          style={{ background: 'hsl(222,20%,9%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'hsl(215,20%,80%)', fontSize: 14 }}
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
          <option value="concluido">Concluído</option>
        </select>
        <button type="submit" style={{ background: 'hsl(28,98%,55%)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Filtrar
        </button>
        {(params.status || params.date) && (
          <a href="/agendamentos" style={{ background: 'hsl(222,20%,12%)', color: 'hsl(215,14%,60%)', padding: '0.5rem 1.25rem', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>
            Limpar
          </a>
        )}
      </form>

      {/* Table */}
      <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(222,20%,12%)' }}>
                {['Data/Hora', 'Cliente', 'Serviço', 'Profissional', 'Status', 'Pagamento', 'Ações'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'hsl(215,14%,45%)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(!appointments || appointments.length === 0) ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(215,14%,40%)', fontSize: 14 }}>
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
                const svc = apt.services && !Array.isArray(apt.services) ? apt.services : null
                const prof = apt.professionals && !Array.isArray(apt.professionals) ? apt.professionals : null
                const sc = statusColors[apt.status] ?? { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' }
                return (
                  <tr key={apt.id} style={{ borderBottom: idx < (appointments?.length ?? 0) - 1 ? '1px solid hsl(222,20%,10%)' : 'none' }}>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,88%)' }}>
                        {new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      <p style={{ fontSize: 12, color: 'hsl(215,14%,50%)' }}>{apt.start_time.slice(0, 5)}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,88%)' }}>{apt.client_name}</p>
                      <p style={{ fontSize: 12, color: 'hsl(215,14%,50%)' }}>{apt.client_phone}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: 'hsl(215,20%,80%)' }}>
                      {svc?.name ?? '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: 'hsl(215,20%,80%)' }}>
                      {prof?.name ?? '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 6, background: sc.bg, color: sc.color }}>
                        {statusLabels[apt.status] ?? apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontSize: 12, color: 'hsl(215,14%,55%)' }}>
                        {apt.payment_method === 'online' ? 'Online' : 'Presencial'}
                      </p>
                      <p style={{ fontSize: 12, color: apt.payment_status === 'pago' ? '#22c55e' : '#f59e0b' }}>
                        {apt.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                      </p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {apt.status === 'pendente' && (
                          <form action={updateAppointmentStatus.bind(null, apt.id, 'confirmado')}>
                            <button type="submit" style={{ fontSize: 11, fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#22c55e', cursor: 'pointer' }}>
                              Confirmar
                            </button>
                          </form>
                        )}
                        {(apt.status === 'pendente' || apt.status === 'confirmado') && (
                          <form action={updateAppointmentStatus.bind(null, apt.id, 'concluido')}>
                            <button type="submit" style={{ fontSize: 11, fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 6, border: 'none', background: 'rgba(107,114,128,0.15)', color: '#9ca3af', cursor: 'pointer' }}>
                              Concluir
                            </button>
                          </form>
                        )}
                        {apt.status !== 'cancelado' && apt.status !== 'concluido' && (
                          <form action={updateAppointmentStatus.bind(null, apt.id, 'cancelado')}>
                            <button type="submit" style={{ fontSize: 11, fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer' }}>
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
