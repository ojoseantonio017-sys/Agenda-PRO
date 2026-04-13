import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { updateProfessional } from '@/app/actions/professionals'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import WorkingHoursSelector from '@/app/(dashboard)/components/working-hours-selector'

export default async function EditarProfissionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const supabase = createServiceRoleClient()
  const { data: userData } = await supabase.from('users').select('company_id').eq('id', user?.id ?? '').single()

  const { data: prof } = await supabase
    .from('professionals')
    .select('*, working_hours(*)')
    .eq('id', id)
    .eq('company_id', userData?.company_id ?? '')
    .single()

  if (!prof) notFound()

  const workingHours: Array<{ day_of_week: number; start_time: string; end_time: string; active: boolean }> =
    prof.working_hours ?? []

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateProfessional(id, formData)
    redirect('/profissionais')
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="/profissionais" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 13, color: 'var(--fg-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={15} />
          Voltar
        </a>
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Editar Profissional</h1>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 48, height: 48, background: 'rgba(124,77,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
              {prof.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{prof.name}</p>
              {prof.bio && <p style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{prof.bio}</p>}
            </div>
          </div>

          <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>
                Nome completo <span style={{ color: 'hsl(258,85%,65%)' }}>*</span>
              </label>
              <input type="text" name="name" defaultValue={prof.name} required className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>Bio / Especialidade</label>
              <input type="text" name="bio" defaultValue={prof.bio ?? ''} className="input" placeholder="Especialista em coloração" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>URL da foto</label>
              <input type="url" name="avatar_url" defaultValue={prof.avatar_url ?? ''} className="input" placeholder="https://..." />
            </div>

            <div>
              <p className="section-label" style={{ marginBottom: '0.75rem' }}>Horários de trabalho</p>
              <WorkingHoursSelector initialHours={workingHours} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <a href="/profissionais" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: 9, background: 'var(--bg-3)', color: 'var(--fg-muted)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
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
