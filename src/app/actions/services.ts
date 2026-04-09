'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createService(formData: FormData) {
  const supabase = await createClient()

  const data = {
    company_id: formData.get('company_id') as string,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
    price: parseInt(formData.get('price') as string, 10),
    active: true,
  }

  if (!data.name || !data.company_id || isNaN(data.duration_minutes) || isNaN(data.price)) {
    throw new Error('Dados inválidos para criação do serviço.')
  }

  const { error } = await supabase.from('services').insert(data)

  if (error) {
    throw new Error(`Erro ao criar serviço: ${error.message}`)
  }

  revalidatePath('/servicos')
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient()

  const data = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
    price: parseInt(formData.get('price') as string, 10),
  }

  const { error } = await supabase.from('services').update(data).eq('id', id)

  if (error) {
    throw new Error(`Erro ao atualizar serviço: ${error.message}`)
  }

  revalidatePath('/servicos')
}

export async function toggleService(id: string, active: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from('services').update({ active }).eq('id', id)

  if (error) {
    throw new Error(`Erro ao atualizar serviço: ${error.message}`)
  }

  revalidatePath('/servicos')
}
