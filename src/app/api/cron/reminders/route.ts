import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendMessage } from '@/lib/whatsapp'

// Roda toda noite às 20h BRT (23h UTC)
// Envia lembrete WhatsApp para todos os clientes com agendamento amanhã

function brazilTomorrow(): string {
  const now = new Date()
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const tomorrow = new Date(brt)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const y = tomorrow.getFullYear()
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const d = String(tomorrow.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const tomorrowStr = brazilTomorrow()

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, client_name, client_phone, date, start_time, services(name), professionals(name), companies(name)')
    .eq('date', tomorrowStr)
    .neq('status', 'cancelado')

  if (error) {
    console.error('[Cron/Reminders] Erro ao buscar agendamentos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  let failed = 0

  for (const apt of appointments ?? []) {
    try {
      const svc     = apt.services      && !Array.isArray(apt.services)      ? apt.services      : null
      const prof    = apt.professionals && !Array.isArray(apt.professionals) ? apt.professionals : null
      const company = apt.companies     && !Array.isArray(apt.companies)     ? apt.companies     : null

      const [y, m, d] = apt.date.split('-')
      const dateFormatted = `${d}/${m}/${y}`

      const message =
        `🔔 *Lembrete de agendamento*\n\n` +
        `Olá, *${apt.client_name}*! Você tem um agendamento amanhã:\n\n` +
        `💇 *Serviço:* ${(svc as { name?: string } | null)?.name ?? '-'}\n` +
        `👤 *Profissional:* ${(prof as { name?: string } | null)?.name ?? '-'}\n` +
        `📅 *Data:* ${dateFormatted}\n` +
        `🕐 *Horário:* ${apt.start_time.slice(0, 5)}\n\n` +
        `_${(company as { name?: string } | null)?.name ?? 'AgendaPRO'}_`

      await sendMessage(apt.client_phone, message)
      sent++
    } catch (err) {
      console.error(`[Cron/Reminders] Falha ao enviar para ${apt.id}:`, err)
      failed++
    }
  }

  console.log(`[Cron/Reminders] Lembretes enviados: ${sent}, falhas: ${failed}, total: ${appointments?.length ?? 0}`)
  return NextResponse.json({ sent, failed, total: appointments?.length ?? 0, date: tomorrowStr })
}
