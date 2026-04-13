import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { updateService } from '@/app/actions/services'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Scissors } from 'lucide-react'

export default async function EditarServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const supabase = createServiceRoleClient()
  const { data: userData } = await supabase.from('users').select('company_id').eq('id', user?.id ?? '').single()

  const { data: svc } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .eq('company_id', userData?.company_id ?? '')
    .single()

  if (!svc) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateService(id, formData)
    redirect('/servicos')
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="/servicos" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 13, color: 'var(--fg-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={15} />
          Voltar
        </a>
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Editar Serviço</h1>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(124,77,255,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scissors size={18} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{svc.name}</p>
              <p style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>ID: {svc.id.slice(0, 8)}…</p>
            </div>
          </div>

          <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>
                Nome do serviço <span style={{ color: 'hsl(258,85%,65%)' }}>*</span>
              </label>
              <input type="text" name="name" defaultValue={svc.name} required className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>Descrição</label>
              <input type="text" name="description" defaultValue={svc.description ?? ''} className="input" placeholder="Descrição opcional" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>
                Duração (minutos) <span style={{ color: 'hsl(258,85%,65%)' }}>*</span>
              </label>
              <input type="number" name="duration_minutes" defaultValue={svc.duration_minutes} required min="1" className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>
                Preço em centavos <span style={{ color: 'hsl(258,85%,65%)' }}>*</span>
              </label>
              <input type="number" name="price" defaultValue={svc.price} required min="0" className="input" />
              <p style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: '0.375rem' }}>
                Atual: R$ {(svc.price / 100).toFixed(2)}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <a href="/servicos" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: 9, background: 'var(--bg-3)', color: 'var(--fg-muted)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Cancelar
              </a>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem', fontSize: 14 }}>
                Salvar alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
