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

export async function createService(formData: FormData) {
  const { supabase, companyId } = await getCompanyId()

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
  const price = parseInt(formData.get('price') as string, 10)

  if (!name) throw new Error('Nome do serviço é obrigatório.')
  if (isNaN(duration_minutes) || duration_minutes <= 0) throw new Error('Duração deve ser maior que zero.')
  if (isNaN(price) || price < 0) throw new Error('Preço inválido.')

  const { error } = await supabase.from('services').insert({
    company_id: companyId,
    name,
    description,
    duration_minutes,
    price,
    active: true,
  })

  if (error) throw new Error(`Erro ao criar serviço: ${error.message}`)

  revalidatePath('/servicos')
}

export async function updateService(id: string, formData: FormData) {
  const { supabase, companyId } = await getCompanyId()

  const { data: existing } = await supabase
    .from('services')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!existing) throw new Error('Serviço não encontrado.')

  const name = (formData.get('name') as string)?.trim()
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
  const price = parseInt(formData.get('price') as string, 10)

  if (!name) throw new Error('Nome do serviço é obrigatório.')
  if (isNaN(duration_minutes) || duration_minutes <= 0) throw new Error('Duração deve ser maior que zero.')
  if (isNaN(price) || price < 0) throw new Error('Preço inválido.')

  const { error } = await supabase.from('services').update({
    name,
    description: (formData.get('description') as string)?.trim() || null,
    duration_minutes,
    price,
  }).eq('id', id).eq('company_id', companyId)

  if (error) throw new Error(`Erro ao atualizar serviço: ${error.message}`)

  revalidatePath('/servicos')
}

export async function deleteService(id: string) {
  const { supabase, companyId } = await getCompanyId()

  const { data: existing } = await supabase
    .from('services')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!existing) throw new Error('Serviço não encontrado.')

  const { error } = await supabase.from('services').delete().eq('id', id).eq('company_id', companyId)
  if (error) throw new Error(`Erro ao excluir serviço: ${error.message}`)

  revalidatePath('/servicos')
}

export async function toggleService(id: string, active: boolean) {
  const { supabase, companyId } = await getCompanyId()

  const { data: existing } = await supabase
    .from('services')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!existing) throw new Error('Serviço não encontrado.')

  const { error } = await supabase.from('services').update({ active }).eq('id', id).eq('company_id', companyId)
  if (error) throw new Error(`Erro ao atualizar serviço: ${error.message}`)

  revalidatePath('/servicos')
}
