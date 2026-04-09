'use client'

import { useState } from 'react'
import { Calendar, MessageCircle, Users, BarChart3, Globe, CreditCard, Check, ChevronDown, ChevronUp } from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Agendamento 24h',
    desc: 'Seus clientes agendam a qualquer hora, mesmo quando você está dormindo. Sem ligações, sem complicação.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Automático',
    desc: 'Confirmações e lembretes enviados automaticamente pelo WhatsApp. Zero esquecimentos.',
  },
  {
    icon: Users,
    title: 'Gestão de Profissionais',
    desc: 'Controle a agenda de cada profissional individualmente com horários e serviços personalizados.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Completos',
    desc: 'Visualize faturamento, agendamentos e desempenho de cada profissional em tempo real.',
  },
  {
    icon: Globe,
    title: 'Página Pública',
    desc: 'Cada negócio tem sua própria URL de agendamento para compartilhar com clientes.',
  },
  {
    icon: CreditCard,
    title: 'Pagamento Online',
    desc: 'Aceite pagamentos antecipados pelo Stripe. Reduza faltas e garanta o faturamento.',
  },
]

const plans = [
  {
    id: 'basico',
    name: 'Básico',
    price: 'R$49',
    period: '/mês',
    highlight: false,
    features: [
      '1 profissional',
      '50 agendamentos/mês',
      'Página pública de agendamento',
      'Notificações por WhatsApp',
      'Suporte por email',
    ],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 'R$99',
    period: '/mês',
    highlight: true,
    badge: 'Mais popular',
    features: [
      '5 profissionais',
      'Agendamentos ilimitados',
      'Página pública de agendamento',
      'Notificações por WhatsApp',
      'Relatórios e analytics',
      'Pagamento online (Stripe)',
      'Suporte prioritário',
    ],
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    price: 'R$179',
    period: '/mês',
    highlight: false,
    features: [
      'Profissionais ilimitados',
      'Múltiplas unidades',
      'Agendamentos ilimitados',
      'Todas as funcionalidades',
      'Acesso à API',
      'Suporte dedicado 24/7',
      'Onboarding personalizado',
    ],
  },
]

const faqs = [
  {
    q: 'Preciso instalar algum aplicativo?',
    a: 'Não! O AgendaPRO é 100% online. Você acessa pelo navegador e seus clientes agendam pela página pública — sem downloads.',
  },
  {
    q: 'Meus clientes precisam criar conta?',
    a: 'Não. Seus clientes apenas acessam a página pública, escolhem o serviço, profissional, data e horário, e confirmam. Simples assim.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Não há fidelidade. Você pode cancelar a qualquer momento direto pelo painel, sem burocracia.',
  },
  {
    q: 'Os dados dos meus clientes são seguros?',
    a: 'Sim. Usamos Supabase com criptografia, Row Level Security e boas práticas de segurança. Cada negócio vê apenas seus próprios dados.',
  },
  {
    q: 'Funciona para qualquer tipo de negócio?',
    a: 'Sim. Salões de beleza, barbearias, clínicas, estúdios, psicólogos, personal trainers — qualquer profissional que trabalhe com horários.',
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao iniciar checkout. Tente novamente.')
      }
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ background: 'hsl(224,24%,3.5%)', color: 'hsl(215,20%,92%)', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid hsl(222,20%,12%)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', position: 'sticky', top: 0, background: 'hsl(224,24%,3.5%)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 32, height: 32, background: 'hsl(28,98%,55%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'hsl(215,20%,92%)' }}>AgendaPRO</span>
        </div>
        <a href="/login" style={{ background: 'hsl(28,98%,55%)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          Entrar
        </a>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem 4rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,120,32,0.12)', border: '1px solid rgba(255,120,32,0.3)', color: 'hsl(28,98%,55%)', padding: '0.25rem 0.875rem', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: '1.5rem' }}>
          Sistema de Agendamento Online
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', maxWidth: 700, margin: '0 auto 1.5rem' }}>
          Seu negócio não para de crescer.{' '}
          <span style={{ color: 'hsl(28,98%,55%)' }}>Sua agenda, também não.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'hsl(215,14%,55%)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Aceite agendamentos online 24 horas, gerencie profissionais e serviços, e automatize confirmações pelo WhatsApp — tudo em um só lugar.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCheckout('profissional')}
            style={{ background: 'hsl(28,98%,55%)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 10, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
          >
            Começar agora — R$99/mês
          </button>
          <a href="#precos" style={{ background: 'hsl(222,20%,10%)', color: 'hsl(215,20%,92%)', padding: '0.875rem 2rem', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '1px solid hsl(222,20%,18%)' }}>
            Ver planos
          </a>
        </div>
        <p style={{ marginTop: '1rem', fontSize: 13, color: 'hsl(215,14%,40%)' }}>
          Sem fidelidade. Cancele quando quiser.
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
          Tudo que você precisa para crescer
        </h2>
        <p style={{ textAlign: 'center', color: 'hsl(215,14%,55%)', marginBottom: '3rem', fontSize: 16 }}>
          Funcionalidades pensadas para negócios de serviços que querem profissionalizar o atendimento.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ width: 44, height: 44, background: 'rgba(255,120,32,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={22} color="hsl(28,98%,55%)" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'hsl(215,14%,55%)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" style={{ padding: '4rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
          Planos para todo tamanho de negócio
        </h2>
        <p style={{ textAlign: 'center', color: 'hsl(215,14%,55%)', marginBottom: '3rem', fontSize: 16 }}>
          Comece pelo Básico e escale conforme seu negócio cresce.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.highlight ? 'hsl(222,20%,9%)' : 'hsl(222,20%,7%)',
                border: plan.highlight ? '2px solid hsl(28,98%,55%)' : '1px solid hsl(222,20%,12%)',
                borderRadius: 14,
                padding: '2rem',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'hsl(28,98%,55%)', color: '#fff', padding: '0.2rem 0.875rem', borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: '0.5rem' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: plan.highlight ? 'hsl(28,98%,55%)' : 'hsl(215,20%,92%)' }}>{plan.price}</span>
                <span style={{ color: 'hsl(215,14%,55%)', fontSize: 14 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plan.features.map((feat) => (
                  <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 14, color: 'hsl(215,20%,80%)' }}>
                    <Check size={16} color="hsl(28,98%,55%)" style={{ flexShrink: 0 }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 9,
                  border: 'none',
                  cursor: loadingPlan === plan.id ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 15,
                  background: plan.highlight ? 'hsl(28,98%,55%)' : 'hsl(222,20%,14%)',
                  color: plan.highlight ? '#fff' : 'hsl(215,20%,85%)',
                  opacity: loadingPlan === plan.id ? 0.7 : 1,
                }}
              >
                {loadingPlan === plan.id ? 'Aguarde...' : 'Contratar agora'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, marginBottom: '2.5rem' }}>
          Perguntas frequentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 10, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'hsl(215,20%,92%)', fontWeight: 600, fontSize: 15, textAlign: 'left' }}
              >
                {faq.q}
                {openFaq === i ? <ChevronUp size={18} color="hsl(28,98%,55%)" /> : <ChevronDown size={18} color="hsl(215,14%,55%)" />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 1.25rem 1rem', color: 'hsl(215,14%,60%)', fontSize: 14, lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,14%)', borderRadius: 16, padding: '3rem 2rem', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Pronto para profissionalizar sua agenda?
          </h2>
          <p style={{ color: 'hsl(215,14%,55%)', marginBottom: '2rem', fontSize: 16 }}>
            Configure em menos de 5 minutos e comece a receber agendamentos hoje.
          </p>
          <button
            onClick={() => handleCheckout('profissional')}
            style={{ background: 'hsl(28,98%,55%)', color: '#fff', padding: '0.875rem 2.5rem', borderRadius: 10, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
          >
            Começar com 7 dias grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid hsl(222,20%,10%)', padding: '2rem 1.5rem', textAlign: 'center', color: 'hsl(215,14%,40%)', fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ width: 24, height: 24, background: 'hsl(28,98%,55%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>A</div>
          <span style={{ fontWeight: 700, color: 'hsl(215,20%,70%)' }}>AgendaPRO</span>
        </div>
        <p>© {new Date().getFullYear()} AgendaPRO. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
