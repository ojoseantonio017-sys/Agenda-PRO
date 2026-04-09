'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createProfessional(formData: FormData) {
  const supabase = await createClient()

  const companyId = formData.get('company_id') as string
  const name = formData.get('name') as string
  const bio = (formData.get('bio') as string) || null
  const avatar_url = (formData.get('avatar_url') as string) || null

  if (!name || !companyId) {
    throw new Error('Nome e empresa são obrigatórios.')
  }

  const { data: professional, error } = await supabase
    .from('professionals')
    .insert({ company_id: companyId, name, bio, avatar_url, active: true })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar profissional: ${error.message}`)
  }

  // Create working hours (only if both start and end are filled)
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
    if (whError) {
      console.error('Erro ao criar horários de trabalho:', whError.message)
    }
  }

  revalidatePath('/profissionais')
}

export async function updateProfessional(id: string, formData: FormData) {
  const supabase = await createClient()

  const data = {
    name: formData.get('name') as string,
    bio: (formData.get('bio') as string) || null,
    avatar_url: (formData.get('avatar_url') as string) || null,
  }

  const { error } = await supabase.from('professionals').update(data).eq('id', id)

  if (error) {
    throw new Error(`Erro ao atualizar profissional: ${error.message}`)
  }

  revalidatePath('/profissionais')
}

export async function toggleProfessional(id: string, active: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from('professionals').update({ active }).eq('id', id)

  if (error) {
    throw new Error(`Erro ao atualizar profissional: ${error.message}`)
  }

  revalidatePath('/profissionais')
}
