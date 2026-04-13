import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendMessage } from '@/lib/whatsapp'

// Roda a cada 30 minutos
// Conclui automaticamente agendamentos confirmados cujo horário já passou
// Envia mensagem de agradecimento ao cliente

function brazilNow(): { date: string; time: string } {
  const now = new Date()
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const iso = brt.toISOString()
  return {
    date: iso.split('T')[0],
    time: iso.split('T')[1].slice(0, 5),
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const { date: todayStr, time: currentTime } = brazilNow()

  // Busca agendamentos confirmados que já passaram:
  // - Data anterior a hoje, OU
  // - Hoje com horário de término já passado
  const { data: pastToday } = await supabase
    .from('appointments')
    .select('id, client_name, client_phone, date, start_time, end_time, services(name), companies(name)')
    .eq('status', 'confirmado')
    .eq('date', todayStr)
    .lte('end_time', currentTime)

  const { data: pastDays } = await supabase
    .from('appointments')
    .select('id, client_name, client_phone, date, start_time, end_time, services(name), companies(name)')
    .eq('status', 'confirmado')
    .lt('date', todayStr)

  const toComplete = [...(pastToday ?? []), ...(pastDays ?? [])]

  let completed = 0
  let thanksSent = 0

  for (const apt of toComplete) {
    try {
      // Marca como concluído e pago
      await supabase
        .from('appointments')
        .update({ status: 'concluido', payment_status: 'pago' })
        .eq('id', apt.id)

      completed++

      // Envia mensagem de agradecimento
      const svc     = apt.services  && !Array.isArray(apt.services)  ? apt.services  : null
      const company = apt.companies && !Array.isArray(apt.companies) ? apt.companies : null

      const message =
        `⭐ *Obrigado pela visita!*\n\n` +
        `Olá, *${apt.client_name}*! Esperamos que tenha gostado do serviço.\n\n` +
        `Foi um prazer atendê-lo(a) com *${(svc as { name?: string } | null)?.name ?? 'nosso serviço'}*.\n\n` +
        `Quando quiser agendar novamente, estamos à disposição! 😊\n\n` +
        `_${(company as { name?: string } | null)?.name ?? 'AgendaPRO'}_`

      await sendMessage(apt.client_phone, message)
      thanksSent++
    } catch (err) {
      console.error(`[Cron/AutoComplete] Erro ao processar agendamento ${apt.id}:`, err)
    }
  }

  console.log(`[Cron/AutoComplete] Concluídos: ${completed}, agradecimentos enviados: ${thanksSent}`)
  return NextResponse.json({ completed, thanksSent })
}
