import { createServiceRoleClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import BookingFlow from './booking-flow'

export default async function AgendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceRoleClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!company) notFound()

  const [{ data: services }, { data: professionals }] = await Promise.all([
    supabase.from('services').select('*').eq('company_id', company.id).eq('active', true),
    supabase
      .from('professionals')
      .select('*, working_hours(*)')
      .eq('company_id', company.id)
      .eq('active', true),
  ])

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(244,22%,4%)', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: 56, height: 56, background: 'hsl(258,85%,65%)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 24, fontWeight: 800, color: '#fff' }}>
          {company.name.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'hsl(215,20%,92%)', marginBottom: '0.5rem' }}>{company.name}</h1>
        {company.whatsapp && (
          <p style={{ color: 'hsl(215,14%,50%)', fontSize: 14 }}>WhatsApp: {company.whatsapp}</p>
        )}
      </div>

      <BookingFlow
        company={company}
        services={services ?? []}
        professionals={professionals ?? []}
      />
    </div>
  )
}
