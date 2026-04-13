import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendMessage } from '@/lib/whatsapp'

// Roda toda manhã às 08h BRT (11h UTC)
// Envia resumo do dia para o WhatsApp de cada empresa com agendamentos hoje

function brazilToday(): string {
  const now = new Date()
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const iso = brt.toISOString()
  return iso.split('T')[0]
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const todayStr = brazilToday()
  const [y, m, d] = todayStr.split('-')
  const dateFormatted = `${d}/${m}/${y}`

  // Busca todas as empresas com agendamentos hoje (não cancelados)
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('company_id, client_name, start_time, services(name, price), companies(name, whatsapp)')
    .eq('date', todayStr)
    .neq('status', 'cancelado')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[Cron/DailySummary] Erro ao buscar agendamentos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Agrupa por empresa
  const byCompany = new Map<string, {
    name: string
    whatsapp: string
    appointments: typeof appointments
  }>()

  for (const apt of appointments ?? []) {
    const company = apt.companies && !Array.isArray(apt.companies) ? apt.companies as { name?: string; whatsapp?: string } : null
    if (!company?.whatsapp) continue // sem WhatsApp cadastrado, pula

    if (!byCompany.has(apt.company_id)) {
      byCompany.set(apt.company_id, {
        name: company.name ?? 'Empresa',
        whatsapp: company.whatsapp,
        appointments: [],
      })
    }
    byCompany.get(apt.company_id)!.appointments.push(apt)
  }

  let summariesSent = 0

  for (const [, company] of byCompany) {
    try {
      const apts = company.appointments
      const totalRevenue = apts.reduce((sum, apt) => {
        const svc = apt.services && !Array.isArray(apt.services) ? apt.services as { price?: number } : null
        return sum + (svc?.price ?? 0)
      }, 0)

      const lines = apts.map((apt) => {
        const svc = apt.services && !Array.isArray(apt.services) ? apt.services as { name?: string } : null
        return `• ${apt.start_time.slice(0, 5)} — ${apt.client_name} (${svc?.name ?? '-'})`
      }).join('\n')

      const message =
        `📋 *Resumo do dia — ${dateFormatted}*\n\n` +
        `Você tem *${apts.length} agendamento${apts.length !== 1 ? 's' : ''}* hoje:\n\n` +
        `${lines}\n\n` +
        `💰 *Receita estimada:* R$ ${(totalRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n` +
        `_${company.name}_`

      await sendMessage(company.whatsapp, message)
      summariesSent++
    } catch (err) {
      console.error(`[Cron/DailySummary] Erro ao enviar para empresa:`, err)
    }
  }

  console.log(`[Cron/DailySummary] Resumos enviados: ${summariesSent} empresa(s)`)
  return NextResponse.json({ summariesSent, date: todayStr })
}
