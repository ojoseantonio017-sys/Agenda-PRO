import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

// Roda a cada 6 horas
// Cancela agendamentos pendentes cujo prazo já passou (data anterior a hoje)
// Agendamentos pendentes = cliente agendou mas ninguém confirmou

function brazilToday(): string {
  const now = new Date()
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  return brt.toISOString().split('T')[0]
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const todayStr = brazilToday()

  // Busca pendentes com data anterior a hoje
  const { data: oldPending, error: fetchError } = await supabase
    .from('appointments')
    .select('id')
    .eq('status', 'pendente')
    .lt('date', todayStr)

  if (fetchError) {
    console.error('[Cron/CancelPending] Erro ao buscar pendentes:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!oldPending || oldPending.length === 0) {
    return NextResponse.json({ cancelled: 0 })
  }

  const ids = oldPending.map((a) => a.id)

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'cancelado' })
    .in('id', ids)

  if (updateError) {
    console.error('[Cron/CancelPending] Erro ao cancelar:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  console.log(`[Cron/CancelPending] Cancelados: ${ids.length} agendamentos pendentes antigos`)
  return NextResponse.json({ cancelled: ids.length })
}
