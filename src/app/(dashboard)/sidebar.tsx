'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Scissors,
  Users,
  UserCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/agendamentos', label: 'Agendamentos', icon: CalendarCheck },
  { href: '/servicos', label: 'Serviços', icon: Scissors },
  { href: '/profissionais', label: 'Profissionais', icon: Users },
  { href: '/clientes', label: 'Clientes', icon: UserCircle },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid hsl(222,20%,12%)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ width: 32, height: 32, background: 'hsl(28,98%,55%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0 }}>A</div>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'hsl(215,20%,92%)' }}>AgendaPRO</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                background: active ? 'rgba(255,120,32,0.12)' : 'transparent',
                color: active ? 'hsl(28,98%,55%)' : 'hsl(215,14%,60%)',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid hsl(222,20%,12%)' }}>
        <form action={logout}>
          <button
            type="submit"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: 'hsl(215,14%,55%)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 400,
            }}
          >
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: 240,
        background: 'hsl(222,20%,5.5%)',
        borderRight: '1px solid hsl(222,20%,10%)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 100,
          background: 'hsl(28,98%,55%)',
          border: 'none',
          borderRadius: 8,
          padding: '0.5rem',
          cursor: 'pointer',
          color: '#fff',
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </>
  )
}
