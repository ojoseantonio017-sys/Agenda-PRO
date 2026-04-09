import { createClient } from '@/lib/supabase/server'
import { CalendarCheck, TrendingUp, DollarSign, Users } from 'lucide-react'

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ComponentType<{ size?: number; color?: string }>; color: string }) {
  return (
    <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ width: 44, height: 44, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ color: 'hsl(215,14%,50%)', fontSize: 13, marginBottom: '0.25rem' }}>{title}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: 'hsl(215,20%,92%)' }}>{value}</p>
      </div>
    </div>
  )
}

const statusColors: Record<string, string> = {
  pendente: '#f59e0b',
  confirmado: '#22c55e',
  cancelado: '#ef4444',
  concluido: '#6b7280',
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  concluido: 'Concluído',
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's company
  const { data: userData } = await supabase
    .from('users')
    .select('company_id, name')
    .eq('id', user?.id ?? '')
    .single()

  const companyId = userData?.company_id

  // Today's range
  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Fetch stats
  const [{ count: todayCount }, { count: weekCount }, { data: appointments }, { count: clientCount }] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('company_id', companyId ?? '').eq('date', today),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('company_id', companyId ?? '').gte('date', weekStartStr),
    supabase.from('appointments').select('*, services(name, price), professionals(name)').eq('company_id', companyId ?? '').eq('date', today).order('start_time').limit(10),
    supabase.from('appointments').select('client_phone', { count: 'exact', head: true }).eq('company_id', companyId ?? ''),
  ])

  // Monthly revenue
  const monthStart = new Date()
  monthStart.setDate(1)
  const { data: monthlyAppts } = await supabase
    .from('appointments')
    .select('services(price)')
    .eq('company_id', companyId ?? '')
    .gte('date', monthStart.toISOString().split('T')[0])
    .eq('payment_status', 'pago')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monthRevenue = (monthlyAppts ?? []).reduce((sum: number, a: any) => {
    const svcData = a.services
    const price = svcData && !Array.isArray(svcData) ? (svcData?.price ?? 0) : 0
    return sum + (price as number)
  }, 0 as number)

  // Bar chart — últimos 7 dias com dados reais
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    return d.toISOString().split('T')[0]
  })
  const { data: weeklyAppts } = await supabase
    .from('appointments')
    .select('date')
    .eq('company_id', companyId ?? '')
    .gte('date', last7Days[0])
    .lte('date', today)

  const dayCountMap: Record<string, number> = {}
  for (const a of weeklyAppts ?? []) {
    dayCountMap[a.date] = (dayCountMap[a.date] ?? 0) + 1
  }
  const barData = last7Days.map(d => dayCountMap[d] ?? 0)
  const barLabels = last7Days.map(d => DAY_LABELS[new Date(d + 'T12:00:00').getDay()])
  const maxBar = Math.max(...barData, 1)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'hsl(215,20%,92%)', marginBottom: '0.25rem' }}>
          Bom dia, {userData?.name?.split(' ')[0] ?? 'usuário'}!
        </h1>
        <p style={{ color: 'hsl(215,14%,50%)', fontSize: 14 }}>
          Aqui está o resumo de hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Agendamentos hoje" value={todayCount ?? 0} icon={CalendarCheck} color="#FF7820" />
        <StatCard title="Esta semana" value={weekCount ?? 0} icon={TrendingUp} color="#22c55e" />
        <StatCard title="Receita do mês" value={`R$ ${(monthRevenue / 100).toFixed(0)}`} icon={DollarSign} color="#3b82f6" />
        <StatCard title="Total de clientes" value={clientCount ?? 0} icon={Users} color="#a855f7" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Today's appointments */}
        <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.5rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1.25rem', color: 'hsl(215,20%,85%)' }}>
            Agendamentos de hoje
          </h2>
          {!appointments || appointments.length === 0 ? (
            <p style={{ color: 'hsl(215,14%,45%)', fontSize: 14, textAlign: 'center', padding: '2rem 0' }}>
              Nenhum agendamento hoje.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appointments.map((apt: {
                id: string
                start_time: string
                client_name: string
                services?: { name?: string; price?: number } | null
                professionals?: { name?: string } | null
                status: string
              }) => {
                const svc = apt.services && !Array.isArray(apt.services) ? apt.services : null
                const prof = apt.professionals && !Array.isArray(apt.professionals) ? apt.professionals : null
                return (
                  <div key={apt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'hsl(224,24%,5%)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'hsl(28,98%,55%)', minWidth: 40 }}>
                        {apt.start_time.slice(0, 5)}
                      </span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(215,20%,88%)' }}>{apt.client_name}</p>
                        <p style={{ fontSize: 12, color: 'hsl(215,14%,50%)' }}>
                          {svc?.name ?? '—'} · {prof?.name ?? '—'}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 6,
                      background: `${statusColors[apt.status] ?? '#6b7280'}20`,
                      color: statusColors[apt.status] ?? '#6b7280',
                    }}>
                      {statusLabels[apt.status] ?? apt.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.5rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1.25rem', color: 'hsl(215,20%,85%)' }}>
            Agendamentos — últimos 7 dias
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 140 }}>
            {barData.map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                {val > 0 && <span style={{ fontSize: 11, color: 'hsl(215,14%,50%)' }}>{val}</span>}
                <div
                  style={{
                    width: '100%',
                    height: `${(val / maxBar) * 100}%`,
                    background: i === barData.length - 1 ? 'hsl(28,98%,55%)' : 'hsl(222,20%,18%)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: 4,
                  }}
                />
                <span style={{ fontSize: 11, color: 'hsl(215,14%,45%)' }}>{barLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
