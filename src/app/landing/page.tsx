'use client'

import { useState } from 'react'
import { Calendar, MessageCircle, Users, BarChart3, Globe, CreditCard, Check, ChevronDown, ChevronUp, ArrowRight, Star, Zap } from 'lucide-react'

const features = [
  { icon: Calendar,       title: 'Agendamento 24h',          desc: 'Seus clientes agendam a qualquer hora, mesmo quando você está dormindo. Sem ligações, sem complicação.' },
  { icon: MessageCircle,  title: 'Notificações WhatsApp',     desc: 'Confirmações e lembretes enviados automaticamente pelo WhatsApp. Zero esquecimentos, zero faltas.' },
  { icon: Users,          title: 'Gestão de Profissionais',   desc: 'Controle a agenda de cada profissional individualmente com horários e serviços personalizados.' },
  { icon: BarChart3,      title: 'Relatórios em Tempo Real',  desc: 'Visualize faturamento, agendamentos e desempenho de cada profissional em um painel intuitivo.' },
  { icon: Globe,          title: 'Página Pública Exclusiva',  desc: 'Cada negócio tem sua própria URL de agendamento para compartilhar com clientes nas redes sociais.' },
  { icon: CreditCard,     title: 'Pagamento Online',          desc: 'Aceite pagamentos antecipados pelo Stripe. Reduza faltas e garanta o faturamento do mês.' },
]

const plans = [
  {
    id: 'basico',
    name: 'Básico',
    price: 'R$49',
    period: '/mês',
    highlight: false,
    features: ['1 profissional', '50 agendamentos/mês', 'Página pública de agendamento', 'Notificações por WhatsApp', 'Suporte por email'],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 'R$99',
    period: '/mês',
    highlight: true,
    badge: 'Mais popular',
    features: ['5 profissionais', 'Agendamentos ilimitados', 'Página pública de agendamento', 'Notificações por WhatsApp', 'Relatórios e analytics', 'Pagamento online (Stripe)', 'Suporte prioritário'],
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    price: 'R$179',
    period: '/mês',
    highlight: false,
    features: ['Profissionais ilimitados', 'Múltiplas unidades', 'Agendamentos ilimitados', 'Todas as funcionalidades', 'Acesso à API', 'Suporte dedicado 24/7', 'Onboarding personalizado'],
  },
]

const faqs = [
  { q: 'Preciso instalar algum aplicativo?', a: 'Não. O AgendaPRO é 100% online. Você acessa pelo navegador e seus clientes agendam pela página pública — sem downloads.' },
  { q: 'Meus clientes precisam criar conta?', a: 'Não. Seus clientes acessam a página pública, escolhem o serviço, profissional, data e horário, e confirmam. Simples assim.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem fidelidade. Você pode cancelar a qualquer momento direto pelo painel, sem burocracia.' },
  { q: 'Os dados dos meus clientes são seguros?', a: 'Sim. Usamos Supabase com criptografia e Row Level Security. Cada negócio vê somente seus próprios dados.' },
  { q: 'Funciona para qualquer tipo de negócio?', a: 'Sim. Salões, barbearias, clínicas, estúdios, psicólogos, personal trainers — qualquer profissional que trabalhe com horários agendados.' },
]

const stats = [
  { value: '2.400+', label: 'Agendamentos processados' },
  { value: '98%',    label: 'Taxa de satisfação' },
  { value: '< 5min', label: 'Para configurar' },
  { value: '24/7',   label: 'Disponível sempre' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planId }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Erro ao iniciar checkout. Tente novamente.')
    } catch { alert('Erro ao iniciar checkout. Tente novamente.') }
    finally { setLoadingPlan(null) }
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '100vh' }}>

      {/* ── Navbar ───────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)', background: 'rgba(9,11,17,0.85)', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 34, height: 34, background: 'var(--primary)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#fff', boxShadow: '0 4px 12px rgba(124,77,255,0.35)' }}>A</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>AgendaPRO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="#precos" style={{ color: 'var(--fg-muted)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Planos</a>
          <a href="/login" className="btn-primary" style={{ padding: '0.5rem 1.125rem', fontSize: 14, borderRadius: 9 }}>Entrar</a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="hero-bg" style={{ textAlign: 'center', padding: '6rem 1.5rem 5rem' }}>
        <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(124,77,255,0.1)', border: '1px solid rgba(124,77,255,0.25)', color: 'var(--primary)', padding: '0.3rem 0.875rem', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: '1.75rem' }}>
          <Zap size={13} fill="currentColor" />
          Sistema de Agendamento Online
        </div>
        <h1 className="animate-fade-up delay-1" style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 760, margin: '0 auto 1.5rem' }}>
          Seu negócio não para de crescer.{' '}
          <span className="gradient-text">Sua agenda, também não.</span>
        </h1>
        <p className="animate-fade-up delay-2" style={{ fontSize: 18, color: 'var(--fg-muted)', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
          Aceite agendamentos online 24 horas, gerencie profissionais e automatize confirmações pelo WhatsApp — tudo em um só lugar.
        </p>
        <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => handleCheckout('profissional')} className="btn-primary" disabled={loadingPlan === 'profissional'} style={{ padding: '0.9rem 2rem', fontSize: 16 }}>
            {loadingPlan === 'profissional' ? 'Aguarde...' : <><span>Começar agora</span><ArrowRight size={18} /></>}
          </button>
          <a href="#precos" className="btn-secondary" style={{ padding: '0.9rem 1.75rem', fontSize: 15 }}>Ver planos</a>
        </div>
        <p style={{ marginTop: '1.25rem', fontSize: 13, color: 'var(--fg-subtle)' }}>Sem fidelidade · Cancele quando quiser · Configuração em 5 minutos</p>
      </section>

      {/* ── Stats bar ────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {stats.map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'var(--fg-subtle)', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>Funcionalidades</p>
          <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Tudo que você precisa para crescer</h2>
          <p style={{ color: 'var(--fg-muted)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Desenvolvido para negócios de serviços que querem profissionalizar o atendimento.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card card-hover" style={{ padding: '1.625rem' }}>
                <div className="feature-icon" style={{ marginBottom: '1.125rem' }}><Icon size={22} color="var(--primary)" /></div>
                <h3 style={{ fontWeight: 700, fontSize: 15.5, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────── */}
      <section id="precos" style={{ padding: '5rem 1.5rem', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>Planos</p>
          <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Para todo tamanho de negócio</h2>
          <p style={{ color: 'var(--fg-muted)', fontSize: 16 }}>Comece pelo Básico e escale conforme seu negócio cresce.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: plan.highlight ? 'hsl(222,20%,8.5%)' : 'var(--card)',
              border: plan.highlight ? '1.5px solid rgba(255,120,32,0.4)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              position: 'relative',
              boxShadow: plan.highlight ? '0 0 40px rgba(124,77,255,0.1)' : 'none',
            }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'hsl(258,85%,60%)', color: '#fff', padding: '0.2rem 1rem', borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Star size={11} fill="white" /> {plan.badge}
                </div>
              )}
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)', marginBottom: '0.5rem' }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', color: plan.highlight ? 'var(--primary)' : 'var(--fg)' }}>{plan.price}</span>
                <span style={{ color: 'var(--fg-muted)', fontSize: 14 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {plan.features.map((feat) => (
                  <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: 14, color: 'hsl(215,20%,78%)' }}>
                    <div style={{ width: 18, height: 18, background: 'rgba(34,197,94,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={11} color="#22c55e" strokeWidth={3} />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className={plan.highlight ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', padding: '0.8rem', fontSize: 14.5 }}
              >
                {loadingPlan === plan.id ? 'Aguarde...' : 'Contratar agora'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 740, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>FAQ</p>
          <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Perguntas frequentes</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="card" style={{ overflow: 'hidden', transition: 'border-color 0.2s', borderColor: openFaq === i ? 'var(--border-2)' : 'var(--border)' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '1.125rem 1.375rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--fg)', fontWeight: 600, fontSize: 15, textAlign: 'left', gap: '1rem' }}
              >
                {faq.q}
                {openFaq === i
                  ? <ChevronUp size={17} color="var(--primary)" style={{ flexShrink: 0 }} />
                  : <ChevronDown size={17} color="var(--fg-subtle)" style={{ flexShrink: 0 }} />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 1.375rem 1.125rem', color: 'var(--fg-muted)', fontSize: 14.5, lineHeight: 1.75 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section style={{ padding: '4rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, background: 'radial-gradient(ellipse, rgba(255,120,32,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.125rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Pronto para profissionalizar sua agenda?
            </h2>
            <p style={{ color: 'var(--fg-muted)', marginBottom: '2rem', fontSize: 16, lineHeight: 1.7 }}>
              Configure em menos de 5 minutos e comece a receber agendamentos hoje.
            </p>
            <button onClick={() => handleCheckout('profissional')} className="btn-primary" disabled={loadingPlan === 'profissional'} style={{ padding: '0.95rem 2.5rem', fontSize: 16 }}>
              {loadingPlan === 'profissional' ? 'Aguarde...' : 'Começar agora'}
            </button>
            <p style={{ marginTop: '1rem', fontSize: 13, color: 'var(--fg-subtle)' }}>Sem cartão de crédito para testar · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ width: 26, height: 26, background: 'var(--primary)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#fff', boxShadow: '0 2px 8px rgba(124,77,255,0.3)' }}>A</div>
          <span style={{ fontWeight: 700, color: 'hsl(215,20%,65%)', fontSize: 14 }}>AgendaPRO</span>
        </div>
        <p>© {new Date().getFullYear()} AgendaPRO. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
