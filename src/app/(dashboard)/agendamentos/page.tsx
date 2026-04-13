import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { updateAppointmentStatus } from '@/app/actions/appointments'
import { CalendarCheck, Clock, CheckCircle2, Calendar } from 'lucide-react'

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
  // Pega o user autenticado pelo JWT (não usa RLS aqui)
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  // Service role para tudo: evita qualquer bloqueio de RLS
  const supabase = createServiceRoleClient()
  const { data: userData } = await supabase.from('users').select('company_id').eq('id', user?.id ?? '').single()
  const companyId = userData?.company_id

  const params = await searchParams
  const today = new Date().toISOString().split('T')[0]

  // Stats query (sem filtros)
  const { data: allAppointments } = await supabase
    .from('appointments')
    .select('id, status, date')
    .eq('company_id', companyId ?? '')

  const statsHoje       = (allAppointments ?? []).filter((a) => a.date === today).length
  const statsPendente   = (allAppointments ?? []).filter((a) => a.status === 'pendente').length
  const statsConfirmado = (allAppointments ?? []).filter((a) => a.status === 'confirmado').length
  const statsTotal      = (allAppointments ?? []).length

  // Filtered query
  let query = supabase
    .from('appointments')
    .select('*, services(name, price), professionals(name)')
    .eq('company_id', companyId ?? '')
    .order('date', { ascending: false })
    .order('start_time', { ascending: true })

  if (params.status) query = query.eq('status', params.status)
  if (params.date)   query = query.eq('date', params.date)

  const { data: appointments } = await query.limit(100)

  const stats = [
    { label: 'Hoje',        value: statsHoje,      icon: CalendarCheck, color: 'hsl(258,85%,65%)', bg: 'rgba(124,77,255,0.1)' },
    { label: 'Pendentes',   value: statsPendente,  icon: Clock,         color: '#f59e0b',           bg: 'rgba(245,158,11,0.1)' },
    { label: 'Confirmados', value: statsConfirmado,icon: CheckCircle2,  color: '#22c55e',           bg: 'rgba(34,197,94,0.1)'  },
    { label: 'Total',       value: statsTotal,     icon: Calendar,      color: 'hsl(215,14%,55%)',  bg: 'var(--bg-3)'          },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Agendamentos</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>Gerencie todos os agendamentos da sua empresa.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginTop: '0.25rem', fontWeight: 500 }}>{label}</p>
            </div>
          </div>
        ))}
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
                const isToday = apt.date === today
                return (
                  <tr key={apt.id} style={{ borderBottom: idx < (appointments?.length ?? 0) - 1 ? '1px solid hsl(222,20%,9%)' : 'none', background: isToday ? 'rgba(124,77,255,0.03)' : 'transparent' }}>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isToday && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(258,85%,65%)', display: 'inline-block', flexShrink: 0 }} />}
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
                            {new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginTop: 2 }}>{apt.start_time.slice(0, 5)}</p>
                        </div>
                      </div>
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
