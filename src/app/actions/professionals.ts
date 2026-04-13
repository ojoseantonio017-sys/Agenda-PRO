'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

async function getCompanyId() {
  // Auth apenas para verificar identidade do usuário via JWT
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Service role para evitar RLS na tabela users
  const supabase = createServiceRoleClient()
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

  const workingHours = []
  for (let day = 0; day <= 6; day++) {
    const start = (formData.get(`start_${day}`) as string)?.trim()
    const end   = (formData.get(`end_${day}`) as string)?.trim()
    if (start && end) {
      const [sH, sM] = start.split(':').map(Number)
      const [eH, eM] = end.split(':').map(Number)
      if (!isNaN(sH) && !isNaN(sM) && !isNaN(eH) && !isNaN(eM) && (sH * 60 + sM) < (eH * 60 + eM)) {
        workingHours.push({
          professional_id: professional.id,
          day_of_week: day,
          start_time: start,
          end_time: end,
          active: true,
        })
      }
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

  const { data: existing } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!existing) throw new Error('Profissional não encontrado.')

  const name = (formData.get('name') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim() || null
  const avatar_url = (formData.get('avatar_url') as string)?.trim() || null

  if (!name) throw new Error('Nome é obrigatório.')

  const { error } = await supabase.from('professionals')
    .update({ name, bio, avatar_url })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) throw new Error(`Erro ao atualizar profissional: ${error.message}`)

  // Substituir horários de trabalho
  await supabase.from('working_hours').delete().eq('professional_id', id)

  const newHours = []
  for (let day = 0; day <= 6; day++) {
    const start = (formData.get(`start_${day}`) as string)?.trim()
    const end   = (formData.get(`end_${day}`) as string)?.trim()
    if (start && end) {
      const [sH, sM] = start.split(':').map(Number)
      const [eH, eM] = end.split(':').map(Number)
      if (!isNaN(sH) && !isNaN(sM) && !isNaN(eH) && !isNaN(eM) && (sH * 60 + sM) < (eH * 60 + eM)) {
        newHours.push({ professional_id: id, day_of_week: day, start_time: start, end_time: end, active: true })
      }
    }
  }
  if (newHours.length > 0) {
    const { error: whError } = await supabase.from('working_hours').insert(newHours)
    if (whError) throw new Error(`Erro ao atualizar horários: ${whError.message}`)
  }

  revalidatePath('/profissionais')
}

export async function deleteProfessional(id: string) {
  const { supabase, companyId } = await getCompanyId()

  const { data: existing } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!existing) throw new Error('Profissional não encontrado.')

  await supabase.from('working_hours').delete().eq('professional_id', id)

  const { error } = await supabase.from('professionals').delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) throw new Error(`Erro ao excluir profissional: ${error.message}`)

  revalidatePath('/profissionais')
}

export async function toggleProfessional(id: string, active: boolean) {
  const { supabase, companyId } = await getCompanyId()

  const { data: existing } = await supabase
    .from('professionals')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!existing) throw new Error('Profissional não encontrado.')

  const { error } = await supabase.from('professionals').update({ active })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) throw new Error(`Erro ao atualizar profissional: ${error.message}`)

  revalidatePath('/profissionais')
}
