import { createClient } from '@/lib/supabase/server'
import { createProfessional, toggleProfessional } from '@/app/actions/professionals'
import { Plus, UserCircle } from 'lucide-react'

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default async function ProfissionaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from('users').select('company_id').eq('id', user?.id ?? '').single()
  const companyId = userData?.company_id

  const { data: professionals } = await supabase
    .from('professionals')
    .select('*, working_hours(*)')
    .eq('company_id', companyId ?? '')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'hsl(215,20%,92%)', marginBottom: '0.25rem' }}>Profissionais</h1>
          <p style={{ color: 'hsl(215,14%,50%)', fontSize: 14 }}>Gerencie a equipe e os horários de trabalho.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* List */}
        <div>
          {(!professionals || professionals.length === 0) ? (
            <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'hsl(215,14%,45%)', fontSize: 14 }}>Nenhum profissional cadastrado. Adicione o primeiro.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  <div key={prof.id} style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: 48, height: 48, background: 'rgba(255,120,32,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {prof.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prof.avatar_url} alt={prof.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <UserCircle size={28} color="hsl(28,98%,55%)" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'hsl(215,20%,90%)' }}>{prof.name}</h3>
                          {!prof.active && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'rgba(107,114,128,0.2)', color: '#9ca3af' }}>INATIVO</span>
                          )}
                        </div>
                        {prof.bio && <p style={{ fontSize: 13, color: 'hsl(215,14%,50%)' }}>{prof.bio}</p>}
                      </div>
                      <form action={toggleProfessional.bind(null, prof.id, !prof.active)}>
                        <button
                          type="submit"
                          style={{
                            fontSize: 12, fontWeight: 600, padding: '0.4rem 0.875rem', borderRadius: 7, border: 'none',
                            background: prof.active ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                            color: prof.active ? '#ef4444' : '#22c55e', cursor: 'pointer',
                          }}
                        >
                          {prof.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </form>
                    </div>

                    {activeHours.length > 0 && (
                      <div style={{ borderTop: '1px solid hsl(222,20%,12%)', paddingTop: '0.875rem' }}>
                        <p style={{ fontSize: 12, color: 'hsl(215,14%,45%)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horários</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {activeHours.map((h) => (
                            <span key={h.day_of_week} style={{ fontSize: 12, padding: '0.25rem 0.625rem', borderRadius: 6, background: 'rgba(255,120,32,0.1)', color: 'hsl(28,98%,60%)' }}>
                              {daysOfWeek[h.day_of_week]} {h.start_time.slice(0, 5)}–{h.end_time.slice(0, 5)}
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
        <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.5rem', position: 'sticky', top: '2rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(215,20%,85%)' }}>
            <Plus size={18} color="hsl(28,98%,55%)" />
            Novo Profissional
          </h2>
          <form action={createProfessional} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="hidden" name="company_id" value={companyId ?? ''} />
            {[
              { name: 'name', label: 'Nome completo', type: 'text', placeholder: 'Maria Silva', required: true },
              { name: 'bio', label: 'Bio / Especialidade', type: 'text', placeholder: 'Especialista em coloração' },
              { name: 'avatar_url', label: 'URL da foto', type: 'url', placeholder: 'https://...' },
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,65%)', marginBottom: '0.375rem' }}>
                  {field.label} {field.required && <span style={{ color: 'hsl(28,98%,55%)' }}>*</span>}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={{
                    width: '100%',
                    background: 'hsl(224,24%,5%)',
                    border: '1px solid hsl(222,20%,16%)',
                    borderRadius: 7,
                    padding: '0.625rem 0.75rem',
                    color: 'hsl(215,20%,88%)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
            ))}

            {/* Working hours */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'hsl(215,20%,65%)', marginBottom: '0.75rem' }}>Horários de trabalho</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {daysOfWeek.map((day, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'hsl(215,14%,55%)', fontWeight: 600 }}>{day}</span>
                    <input
                      type="time"
                      name={`start_${i}`}
                      style={{ background: 'hsl(224,24%,5%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 6, padding: '0.4rem 0.5rem', color: 'hsl(215,20%,80%)', fontSize: 12 }}
                    />
                    <input
                      type="time"
                      name={`end_${i}`}
                      style={{ background: 'hsl(224,24%,5%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 6, padding: '0.4rem 0.5rem', color: 'hsl(215,20%,80%)', fontSize: 12 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'hsl(28,98%,55%)',
                color: '#fff',
                padding: '0.7rem',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                marginTop: '0.25rem',
              }}
            >
              Adicionar profissional
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
