/**
 * WhatsApp notification utility for AgendaPRO.
 *
 * Supports two providers via environment variables:
 *
 * — Meta WhatsApp Cloud API (official):
 *     WHATSAPP_PROVIDER=meta
 *     WHATSAPP_TOKEN=<access_token>
 *     WHATSAPP_PHONE_ID=<phone_number_id>
 *
 * — Evolution API / Z-API / any REST gateway (popular in BR):
 *     WHATSAPP_PROVIDER=gateway
 *     WHATSAPP_GATEWAY_URL=https://seu-gateway.com/message/text
 *     WHATSAPP_TOKEN=<api_token>
 *
 * If none of these are set the function is a no-op (graceful skip).
 */

export interface AppointmentNotificationData {
  clientName: string
  clientPhone: string       // digits only, Brazilian format: 5511999999999
  serviceName: string
  professionalName: string
  date: string              // YYYY-MM-DD
  startTime: string         // HH:MM
  companyName: string
  companyWhatsapp?: string  // used to build the reply-to hint
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  // Ensure Brazilian country code
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
}

function buildMessage(data: AppointmentNotificationData): string {
  const [year, month, day] = data.date.split('-')
  const dateFormatted = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
  return (
    `✅ *Agendamento confirmado!*\n\n` +
    `Olá, *${data.clientName}*! Seu agendamento foi recebido com sucesso.\n\n` +
    `📋 *Serviço:* ${data.serviceName}\n` +
    `💇 *Profissional:* ${data.professionalName}\n` +
    `📅 *Data:* ${dateFormatted}\n` +
    `🕐 *Horário:* ${data.startTime}\n\n` +
    `_${data.companyName}_`
  )
}

async function sendViaMeta(phone: string, message: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN!
  const phoneId = process.env.WHATSAPP_PHONE_ID!

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message, preview_url: false },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    console.error('[WhatsApp Meta] Error:', err)
  }
}

async function sendViaGateway(phone: string, message: string): Promise<void> {
  const url = process.env.WHATSAPP_GATEWAY_URL!
  const token = process.env.WHATSAPP_TOKEN

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ phone, message }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[WhatsApp Gateway] Error:', err)
  }
}

export async function sendAppointmentConfirmation(
  data: AppointmentNotificationData
): Promise<void> {
  const provider = process.env.WHATSAPP_PROVIDER

  if (!provider) return // not configured — skip silently

  const phone = formatPhone(data.clientPhone)
  const message = buildMessage(data)

  try {
    if (provider === 'meta') {
      if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) return
      await sendViaMeta(phone, message)
    } else if (provider === 'gateway') {
      if (!process.env.WHATSAPP_GATEWAY_URL) return
      await sendViaGateway(phone, message)
    }
  } catch (err) {
    // Never let notification failure break the booking flow
    console.error('[WhatsApp] Notification failed (non-blocking):', err)
  }
}
