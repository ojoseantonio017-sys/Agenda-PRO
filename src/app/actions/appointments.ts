'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendAppointmentConfirmation } from '@/lib/whatsapp'

export async function createAppointment(formData: FormData) {
  const supabase = createServiceRoleClient()

  const companyId        = formData.get('company_id') as string
  const professionalId   = formData.get('professional_id') as string
  const serviceId        = formData.get('service_id') as string
  const clientName       = formData.get('client_name') as string
  const clientPhone      = formData.get('client_phone') as string

  const data = {
    company_id: companyId,
    professional_id: professionalId,
    service_id: serviceId,
    client_name: clientName,
    client_phone: clientPhone,
    client_email: (formData.get('client_email') as string) || null,
    date: formData.get('date') as string,
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
    status: 'pendente',
    payment_method: 'presencial',
    payment_status: 'pendente',
  }

  const { error } = await supabase.from('appointments').insert(data)

  if (error) {
    throw new Error(`Erro ao criar agendamento: ${error.message}`)
  }

  // Enviar notificação WhatsApp ao cliente (non-blocking)
  const [companyRes, serviceRes, profRes] = await Promise.all([
    supabase.from('companies').select('name, whatsapp').eq('id', companyId).single(),
    supabase.from('services').select('name').eq('id', serviceId).single(),
    supabase.from('professionals').select('name').eq('id', professionalId).single(),
  ])

  sendAppointmentConfirmation({
    clientName,
    clientPhone,
    serviceName: serviceRes.data?.name ?? '',
    professionalName: profRes.data?.name ?? '',
    date: data.date,
    startTime: data.start_time,
    companyName: companyRes.data?.name ?? '',
    companyWhatsapp: companyRes.data?.whatsapp ?? undefined,
  }).catch(() => {/* silently ignore */})

  revalidatePath('/agendamentos')
}

export async function updateAppointmentStatus(id: string, status: string) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const supabase = createServiceRoleClient()
  const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!userData?.company_id) throw new Error('Empresa não encontrada')

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .eq('company_id', userData.company_id)

  if (error) {
    throw new Error(`Erro ao atualizar status: ${error.message}`)
  }

  revalidatePath('/agendamentos')
  revalidatePath('/dashboard')
}

export async function listAppointments(filters: {
  status?: string
  date?: string
  professional_id?: string
  company_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id ?? '')
    .single()

  let query = supabase
    .from('appointments')
    .select('*, services(name, price), professionals(name)')
    .eq('company_id', filters.company_id ?? userData?.company_id ?? '')
    .order('date', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.date) query = query.eq('date', filters.date)
  if (filters.professional_id) query = query.eq('professional_id', filters.professional_id)

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data
}
