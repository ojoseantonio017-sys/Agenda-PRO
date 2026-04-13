'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendAppointmentConfirmation } from '@/lib/whatsapp'

const VALID_STATUSES = ['pendente', 'confirmado', 'cancelado', 'concluido'] as const
type AppointmentStatus = typeof VALID_STATUSES[number]

export async function createAppointment(formData: FormData) {
  const supabase = createServiceRoleClient()

  const companyId      = (formData.get('company_id') as string)?.trim()
  const professionalId = (formData.get('professional_id') as string)?.trim()
  const serviceId      = (formData.get('service_id') as string)?.trim()
  const clientName     = (formData.get('client_name') as string)?.trim()
  const clientPhone    = (formData.get('client_phone') as string)?.replace(/\D/g, '')
  const date           = (formData.get('date') as string)?.trim()
  const startTime      = (formData.get('start_time') as string)?.trim()
  const endTime        = (formData.get('end_time') as string)?.trim()

  // Validar campos obrigatórios
  if (!companyId || !professionalId || !serviceId || !clientName || !clientPhone || !date || !startTime || !endTime)
    throw new Error('Dados incompletos para o agendamento.')

  // Validar formatos de data e hora
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new Error('Formato de data inválido.')
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime))
    throw new Error('Formato de horário inválido.')

  // Validar que data não é passada
  const [y, m, d] = date.split('-').map(Number)
  const bookingDate = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (bookingDate < today) throw new Error('Não é possível agendar para datas passadas.')

  // Validar integridade referencial: profissional e serviço pertencem à empresa
  const [profCheck, svcCheck] = await Promise.all([
    supabase.from('professionals').select('id').eq('id', professionalId).eq('company_id', companyId).eq('active', true).single(),
    supabase.from('services').select('id').eq('id', serviceId).eq('company_id', companyId).eq('active', true).single(),
  ])
  if (!profCheck.data) throw new Error('Profissional não encontrado.')
  if (!svcCheck.data)  throw new Error('Serviço não encontrado.')

  const data = {
    company_id:      companyId,
    professional_id: professionalId,
    service_id:      serviceId,
    client_name:     clientName,
    client_phone:    clientPhone,
    client_email:    (formData.get('client_email') as string)?.trim() || null,
    date,
    start_time:      startTime,
    end_time:        endTime,
    status:          'pendente',
    payment_method:  'presencial',
    payment_status:  'pendente',
  }

  const { error } = await supabase.from('appointments').insert(data)
  if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`)

  // Notificação WhatsApp ao cliente (non-blocking)
  const [companyRes, serviceRes, profRes] = await Promise.all([
    supabase.from('companies').select('name, whatsapp').eq('id', companyId).single(),
    supabase.from('services').select('name').eq('id', serviceId).single(),
    supabase.from('professionals').select('name').eq('id', professionalId).single(),
  ])

  sendAppointmentConfirmation({
    clientName,
    clientPhone,
    serviceName:      serviceRes.data?.name ?? '',
    professionalName: profRes.data?.name ?? '',
    date:             data.date,
    startTime:        data.start_time,
    companyName:      companyRes.data?.name ?? '',
    companyWhatsapp:  companyRes.data?.whatsapp ?? undefined,
  }).catch(() => {/* silently ignore */})

  revalidatePath('/agendamentos')
}

export async function updateAppointmentStatus(id: string, status: string) {
  // Validar status para evitar valores inválidos
  if (!VALID_STATUSES.includes(status as AppointmentStatus)) {
    throw new Error('Status inválido')
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createServiceRoleClient()
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) throw new Error('Empresa não encontrada')

  // Ao concluir, marca automaticamente como pago (pagamento presencial)
  const updateData: Record<string, string> = { status }
  if (status === 'concluido') updateData.payment_status = 'pago'

  const { error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', userData.company_id)

  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)

  revalidatePath('/agendamentos')
  revalidatePath('/dashboard')
}
