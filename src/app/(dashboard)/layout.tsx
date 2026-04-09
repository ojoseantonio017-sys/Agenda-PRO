import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from './sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(224,24%,3.5%)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto', marginLeft: 0 }}>
        {children}
      </main>
    </div>
  )
}
