import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { createProfessional, toggleProfessional, deleteProfessional } from '@/app/actions/professionals'
import { Plus, UserCircle, Clock, Pencil } from 'lucide-react'

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default async function ProfissionaisPage() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const supabase = createServiceRoleClient()
  const { data: userData } = await supabase.from('users').select('company_id').eq('id', user?.id ?? '').single()
  const companyId = userData?.company_id

  const { data: professionals } = await supabase
    .from('professionals')
    .select('*, working_hours(*)')
    .eq('company_id', companyId ?? '')
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Profissionais</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>Gerencie a equipe e os horários de trabalho.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

        {/* List */}
        <div>
          {(!professionals || professionals.length === 0) ? (
            <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, background: 'var(--bg-3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <UserCircle size={26} color="var(--fg-subtle)" />
              </div>
              <p style={{ color: 'var(--fg-muted)', fontSize: 14, fontWeight: 500 }}>Nenhum profissional cadastrado.</p>
              <p style={{ color: 'var(--fg-subtle)', fontSize: 13, marginTop: '0.375rem' }}>Adicione o primeiro no formulário ao lado.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {professionals.map((prof: {
                id: string
                name: string
                bio?: string
                avatar_url?: string
                active: boolean
                working_hours?: Array<{ day_of_week: number; start_time: string; end_time: string; active: boolean }>
              }) => {
                const activeHours = (prof.working_hours ?? []).filter((h) => h.active)
                return (
                  <div key={prof.id} className="card" style={{ padding: '1.375rem', opacity: prof.active ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: activeHours.length > 0 ? '1rem' : 0 }}>
                      {/* Avatar */}
                      <div style={{ width: 48, height: 48, background: prof.active ? 'rgba(124,77,255,0.1)' : 'var(--bg-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {prof.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prof.avatar_url} alt={prof.name} style={{ width: 48, height: 48, objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: 18, fontWeight: 800, color: prof.active ? 'var(--primary)' : 'var(--fg-subtle)' }}>
                            {prof.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.01em' }}>{prof.name}</h3>
                          {!prof.active && (
                            <span className="badge" style={{ background: 'rgba(107,114,128,0.15)', color: '#6b7280' }}>Inativo</span>
                          )}
                        </div>
                        {prof.bio && (
                          <p style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{prof.bio}</p>
                        )}
                        {activeHours.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.375rem', fontSize: 12, color: 'var(--fg-subtle)' }}>
                            <Clock size={12} />
                            {activeHours.length} dia{activeHours.length !== 1 ? 's' : ''} configurado{activeHours.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                        <a
                          href={`/profissionais/${prof.id}/editar`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: 12, fontWeight: 700, padding: '0.4rem 0.75rem', borderRadius: 7,
                            background: 'rgba(124,77,255,0.08)', color: 'hsl(258,85%,72%)',
                            textDecoration: 'none', border: '1px solid rgba(124,77,255,0.15)',
                          }}
                        >
                          <Pencil size={12} />
                          Editar
                        </a>
                        <form action={toggleProfessional.bind(null, prof.id, !prof.active)}>
                          <button type="submit" style={{
                            fontSize: 12, fontWeight: 700, padding: '0.4rem 0.75rem', borderRadius: 7, border: 'none',
                            background: prof.active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                            color: prof.active ? '#ef4444' : '#22c55e',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}>
                            {prof.active ? 'Desativar' : 'Ativar'}
                          </button>
                        </form>
                        <form action={deleteProfessional.bind(null, prof.id)} onSubmit={(e) => { if (!confirm('Excluir este profissional?')) e.preventDefault() }}>
                          <button type="submit" style={{
                            fontSize: 12, fontWeight: 700, padding: '0.4rem 0.75rem', borderRadius: 7, border: 'none',
                            background: 'rgba(239,68,68,0.06)', color: '#ef4444',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}>
                            Excluir
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Hours */}
                    {activeHours.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                        <p className="section-label" style={{ marginBottom: '0.625rem' }}>Horários</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {activeHours.map((h) => (
                            <span key={h.day_of_week} style={{ fontSize: 12, fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 6, background: 'rgba(124,77,255,0.08)', color: 'hsl(258,85%,72%)', border: '1px solid rgba(124,77,255,0.15)' }}>
                              {daysOfWeek[h.day_of_week]} · {h.start_time.slice(0,5)}–{h.end_time.slice(0,5)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add form */}
        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
          <h2 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--fg)' }}>
            <div style={{ width: 28, height: 28, background: 'var(--primary-glow)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={16} color="var(--primary)" />
            </div>
            Novo Profissional
          </h2>
          <form action={createProfessional} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="hidden" name="company_id" value={companyId ?? ''} />

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>
                Nome completo <span style={{ color: 'hsl(258,85%,65%)' }}>*</span>
              </label>
              <input type="text" name="name" placeholder="Maria Silva" required className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>Bio / Especialidade</label>
              <input type="text" name="bio" placeholder="Especialista em coloração" className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,62%)', marginBottom: '0.4rem' }}>URL da foto</label>
              <input type="url" name="avatar_url" placeholder="https://..." className="input" />
            </div>

            {/* Working hours */}
            <div>
              <p className="section-label" style={{ marginBottom: '0.75rem' }}>Horários de trabalho</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {daysOfWeek.map((day, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.75rem 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>{day}</span>
                    <input type="time" name={`start_${i}`} className="input" style={{ padding: '0.4rem 0.5rem', fontSize: 13 }} />
                    <input type="time" name={`end_${i}`}   className="input" style={{ padding: '0.4rem 0.5rem', fontSize: 13 }} />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: 14, marginTop: '0.25rem' }}>
              Adicionar profissional
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
