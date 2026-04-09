import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { Resend } from 'resend'

export const runtime = 'nodejs'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' })
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const error = err as { message?: string }
    console.error('Webhook signature verification failed:', error?.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const plan = session.metadata?.plan ?? 'basico'
    const customerEmail = session.customer_details?.email
    const customerName = session.customer_details?.name ?? customerEmail?.split('@')[0] ?? 'Usuário'

    if (!customerEmail) {
      return NextResponse.json({ error: 'No customer email' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    try {
      // Create unique slug
      const baseSlug = slugify(customerName)
      let slug = baseSlug
      let attempt = 0
      while (attempt < 10) {
        const { data: existing } = await supabase.from('companies').select('id').eq('slug', slug).single()
        if (!existing) break
        attempt++
        slug = `${baseSlug}-${attempt}`
      }

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: customerName, slug, plan, email: customerEmail, active: true })
        .select()
        .single()

      if (companyError) throw companyError

      // Create auth user
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          company_id: company.id,
          name: customerName,
          role: 'admin',
        },
      })

      if (authError) throw authError

      // Send welcome email
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey && authData.user) {
        const resend = new Resend(resendKey)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        await resend.emails.send({
          from: 'AgendaPRO <noreply@agendapro.com.br>',
          to: customerEmail,
          subject: 'Bem-vindo ao AgendaPRO! Seus dados de acesso',
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0a0d14;color:#e8ecf0;padding:2rem;border-radius:12px;">
              <h1 style="color:#FF7820;margin-bottom:0.5rem;">AgendaPRO</h1>
              <h2 style="color:#e8ecf0;margin-bottom:1.5rem;">Bem-vindo, ${customerName}!</h2>
              <p style="color:#8892a0;margin-bottom:1.5rem;">Seu plano <strong style="color:#FF7820;">${plan}</strong> está ativo. Veja seus dados de acesso:</p>
              <div style="background:#111827;border:1px solid #1f2937;border-radius:8px;padding:1.25rem;margin-bottom:1.5rem;">
                <p style="margin:0 0 0.5rem;"><strong>Email:</strong> ${customerEmail}</p>
                <p style="margin:0 0 0.5rem;"><strong>Senha temporária:</strong> ${tempPassword}</p>
                <p style="margin:0;"><strong>Sua página de agendamento:</strong> <a href="${appUrl}/agendar/${slug}" style="color:#FF7820;">${appUrl}/agendar/${slug}</a></p>
              </div>
              <p style="color:#8892a0;font-size:13px;">Recomendamos que você altere sua senha após o primeiro acesso.</p>
              <a href="${appUrl}/login" style="display:inline-block;background:#FF7820;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;margin-top:1rem;">Acessar minha conta</a>
            </div>
          `,
        })
      }
    } catch (err) {
      console.error('Error processing checkout.session.completed:', err)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
