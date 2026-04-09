'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarCheck, Scissors, Users, LogOut, Menu, X } from 'lucide-react'
import { logout } from '@/app/actions/auth'

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/agendamentos', label: 'Agendamentos',    icon: CalendarCheck },
  { href: '/servicos',     label: 'Serviços',        icon: Scissors },
  { href: '/profissionais', label: 'Profissionais',  icon: Users },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '1.375rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff', boxShadow: '0 3px 10px rgba(255,120,32,0.3)', flexShrink: 0 }}>A</div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--fg)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>AgendaPRO</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        <p className="section-label" style={{ padding: '0 0.5rem', marginBottom: '0.625rem' }}>Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${active ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.875rem 0.75rem', borderTop: '1px solid var(--border)' }}>
        <form action={logout}>
          <button type="submit" className="nav-link" style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'transparent', fontSize: 13.5, fontFamily: 'inherit' }}>
            <LogOut size={17} />
            Sair
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{ width: 228, background: 'hsl(222,22%,5%)', borderRight: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        {sidebarContent}
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ display: 'none', position: 'fixed', top: 14, left: 14, zIndex: 200, background: 'var(--primary)', border: 'none', borderRadius: 9, padding: '0.5rem', cursor: 'pointer', color: '#fff', boxShadow: '0 4px 12px rgba(255,120,32,0.3)' }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150, backdropFilter: 'blur(4px)' }} />
          <aside style={{ display: 'none', position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, zIndex: 160, background: 'hsl(222,22%,5%)', borderRight: '1px solid var(--border)' }}>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
