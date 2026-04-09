import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const PLANS = {
  basico: { name: 'AgendaPRO Básico', amount: 4900 },
  profissional: { name: 'AgendaPRO Profissional', amount: 9900 },
  empresarial: { name: 'AgendaPRO Empresarial', amount: 17900 },
}

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  }

  try {
    const { plan } = await request.json()
    const validPlans = ['basico', 'profissional', 'empresarial'] as const
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' })
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const planData = PLANS[plan as keyof typeof PLANS]

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: planData.name },
            unit_amount: planData.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/sucesso?plan=${plan}`,
      cancel_url: `${APP_URL}/landing`,
      metadata: { plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const error = err as { message?: string }
    return NextResponse.json(
      { error: 'Erro ao criar sessão', detail: error?.message },
      { status: 500 }
    )
  }
}
