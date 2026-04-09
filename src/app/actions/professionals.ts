'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getCompanyId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()
  if (!userData?.company_id) throw new Error('Empresa não encontrada')
  return { supabase, companyId: userData.company_id as string }
}

export async function createProfessional(formData: FormData) {
  const { supabase, companyId } = await getCompanyId()

  const name = (formData.get('name') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim() || null
  const avatar_url = (formData.get('avatar_url') as string)?.trim() || null

  if (!name) throw new Error('Nome é obrigatório.')

  const { data: professional, error } = await supabase
    .from('professionals')
    .insert({ company_id: companyId, name, bio, avatar_url, active: true })
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar profissional: ${error.message}`)

  // Criar horários de trabalho (apenas se início e fim forem preenchidos)
  const workingHours = []
  for (let day = 0; day <= 6; day++) {
    const start = formData.get(`start_${day}`) as string
    const end = formData.get(`end_${day}`) as string
    if (start && end && start < end) {
      workingHours.push({
        professional_id: professional.id,
        day_of_week: day,
        start_time: start,
        end_time: end,
        active: true,
      })
    }
  }

  if (workingHours.length > 0) {
    const { error: whError } = await supabase.from('working_hours').insert(workingHours)
    if (whError) throw new Error(`Erro ao criar horários de trabalho: ${whError.message}`)
  }

  revalidatePath('/profissionais')
}

export async function updateProfessional(id: string, formData: FormData) {
  const { supabase, companyId } = await getCompanyId()

  // Verifica se o profissional pertence à empresa do usuário
  const { data: existing } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!existing) throw new Error('Profissional não encontrado.')

  const data = {
    name: (formData.get('name') as string)?.trim(),
    bio: (formData.get('bio') as string)?.trim() || null,
    avatar_url: (formData.get('avatar_url') as string)?.trim() || null,
  }

  if (!data.name) throw new Error('Nome é obrigatório.')

  const { error } = await supabase.from('professionals').update(data).eq('id', id)
  if (error) throw new Error(`Erro ao atualizar profissional: ${error.message}`)

  revalidatePath('/profissionais')
}

export async function toggleProfessional(id: string, active: boolean) {
  const { supabase, companyId } = await getCompanyId()

  // Verifica se o profissional pertence à empresa do usuário
  const { data: existing } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!existing) throw new Error('Profissional não encontrado.')

  const { error } = await supabase.from('professionals').update({ active }).eq('id', id)
  if (error) throw new Error(`Erro ao atualizar profissional: ${error.message}`)

  revalidatePath('/profissionais')
}
