'use client'

import { useState } from 'react'
import { createAppointment } from '@/app/actions/appointments'

interface Service {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
}

interface WorkingHour {
  day_of_week: number
  start_time: string
  end_time: string
  active: boolean
}

interface Professional {
  id: string
  name: string
  bio?: string
  avatar_url?: string
  working_hours?: WorkingHour[]
}

interface Company {
  id: string
  name: string
  slug: string
  whatsapp?: string
}

interface BookingFlowProps {
  company: Company
  services: Service[]
  professionals: Professional[]
}

const STEPS = ['Serviço', 'Profissional', 'Data & Hora', 'Seus dados', 'Confirmação']

function generateTimeSlots(startTime: string, endTime: string, durationMin: number): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  let current = startH * 60 + startM
  const end = endH * 60 + endM
  while (current + durationMin <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += durationMin
  }
  return slots
}

export default function BookingFlow({ company, services, professionals }: BookingFlowProps) {
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  // Get available slots for selected date and professional
  const getSlots = (): string[] => {
    if (!selectedDate || !selectedProfessional || !selectedService) return []
    const dateObj = new Date(selectedDate + 'T12:00:00')
    const dayOfWeek = dateObj.getDay()
    const wh = (selectedProfessional.working_hours ?? []).find(
      (h) => h.day_of_week === dayOfWeek && h.active
    )
    if (!wh) return []
    return generateTimeSlots(wh.start_time, wh.end_time, selectedService.duration_minutes)
  }

  async function handleConfirm() {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    const phoneClean = clientPhone.replace(/\D/g, '')
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      setError('Telefone inválido. Use o formato (11) 99999-9999.')
      return
    }
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      setError('Email inválido.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const [h, m] = selectedTime.split(':').map(Number)
      const endMin = h * 60 + m + selectedService.duration_minutes
      const endH = Math.floor(endMin / 60).toString().padStart(2, '0')
      const endM = (endMin % 60).toString().padStart(2, '0')

      const fd = new FormData()
      fd.append('company_id', company.id)
      fd.append('professional_id', selectedProfessional.id)
      fd.append('service_id', selectedService.id)
      fd.append('client_name', clientName)
      fd.append('client_phone', clientPhone)
      fd.append('client_email', clientEmail)
      fd.append('date', selectedDate)
      fd.append('start_time', selectedTime)
      fd.append('end_time', `${endH}:${endM}`)

      await createAppointment(fd)
      setDone(true)
    } catch {
      setError('Erro ao confirmar agendamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    const waLink = company.whatsapp
      ? `https://wa.me/55${company.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Acabei de agendar um horário: ${selectedService?.name} em ${selectedDate} às ${selectedTime}. Meu nome é ${clientName}.`)}`
      : null

    return (
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 14, padding: '2.5rem' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 32 }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'hsl(215,20%,92%)', marginBottom: '0.75rem' }}>Agendamento confirmado!</h2>
          <p style={{ color: 'hsl(215,14%,55%)', fontSize: 14, lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {selectedService?.name} com <strong style={{ color: 'hsl(215,20%,85%)' }}>{selectedProfessional?.name}</strong><br />
            <strong style={{ color: 'hsl(258,85%,65%)' }}>{selectedDate} às {selectedTime}</strong>
          </p>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#25D366',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              💬 Confirmar pelo WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    background: 'hsl(224,24%,5%)',
    border: '1px solid hsl(222,20%,16%)',
    borderRadius: 8,
    padding: '0.7rem 0.875rem',
    color: 'hsl(215,20%,88%)',
    fontSize: 15,
    outline: 'none',
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Steps */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', justifyContent: 'center' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i === step ? 'hsl(258,85%,65%)' : i < step ? 'rgba(34,197,94,0.3)' : 'hsl(222,20%,12%)',
              color: i === step ? '#fff' : i < step ? '#22c55e' : 'hsl(215,14%,45%)',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{i < step ? '✓' : i + 1}</div>
            {i < STEPS.length - 1 && <span style={{ fontSize: 12, color: 'hsl(215,14%,35%)' }}>›</span>}
          </div>
        ))}
      </div>

      <div style={{ background: 'hsl(222,20%,7%)', border: '1px solid hsl(222,20%,12%)', borderRadius: 14, padding: '1.75rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'hsl(215,20%,85%)', marginBottom: '1.5rem' }}>
          Passo {step + 1}: {STEPS[step]}
        </h2>

        {/* Step 1: Service */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => { setSelectedService(svc); setStep(1) }}
                style={{
                  background: selectedService?.id === svc.id ? 'rgba(124,77,255,0.12)' : 'hsl(224,24%,5%)',
                  border: `1px solid ${selectedService?.id === svc.id ? 'hsl(258,85%,65%)' : 'hsl(222,20%,16%)'}`,
                  borderRadius: 10, padding: '1rem', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'hsl(215,20%,90%)', marginBottom: '0.25rem' }}>{svc.name}</p>
                  {svc.description && <p style={{ fontSize: 13, color: 'hsl(215,14%,50%)' }}>{svc.description}</p>}
                  <p style={{ fontSize: 13, color: 'hsl(215,14%,50%)', marginTop: '0.25rem' }}>{svc.duration_minutes} min</p>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'hsl(258,85%,65%)', flexShrink: 0, marginLeft: '1rem' }}>
                  R$ {(svc.price / 100).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Professional */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {professionals.map((prof) => (
              <button
                key={prof.id}
                onClick={() => { setSelectedProfessional(prof); setStep(2) }}
                style={{
                  background: selectedProfessional?.id === prof.id ? 'rgba(124,77,255,0.12)' : 'hsl(224,24%,5%)',
                  border: `1px solid ${selectedProfessional?.id === prof.id ? 'hsl(258,85%,65%)' : 'hsl(222,20%,16%)'}`,
                  borderRadius: 10, padding: '1rem', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                }}
              >
                <div style={{ width: 40, height: 40, background: 'rgba(124,77,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'hsl(258,85%,72%)', flexShrink: 0 }}>
                  {prof.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'hsl(215,20%,90%)' }}>{prof.name}</p>
                  {prof.bio && <p style={{ fontSize: 13, color: 'hsl(215,14%,50%)' }}>{prof.bio}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,65%)', marginBottom: '0.5rem' }}>Data</label>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
                style={inputStyle}
              />
            </div>

            {!selectedDate ? (
              <div style={{ textAlign: 'center', padding: '1.75rem', background: 'hsl(224,24%,5%)', borderRadius: 10, border: '1px dashed hsl(222,20%,18%)' }}>
                <div style={{ fontSize: 32, marginBottom: '0.625rem' }}>📅</div>
                <p style={{ color: 'hsl(215,14%,50%)', fontSize: 14, fontWeight: 500 }}>Selecione uma data para ver os horários disponíveis</p>
              </div>
            ) : getSlots().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.75rem', background: 'hsl(224,24%,5%)', borderRadius: 10, border: '1px dashed hsl(222,20%,18%)' }}>
                <div style={{ fontSize: 32, marginBottom: '0.625rem' }}>😕</div>
                <p style={{ color: 'hsl(215,14%,50%)', fontSize: 14, fontWeight: 500 }}>Nenhum horário disponível nesta data</p>
                <p style={{ color: 'hsl(215,14%,38%)', fontSize: 13, marginTop: '0.375rem' }}>Tente outro dia da semana.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,65%)' }}>Horários disponíveis</label>
                  <span style={{ fontSize: 12, color: 'hsl(258,85%,65%)', fontWeight: 600, background: 'rgba(124,77,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
                    {getSlots().length} horário{getSlots().length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                  {getSlots().map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: '0.875rem 0.5rem',
                        borderRadius: 10,
                        border: `1.5px solid ${selectedTime === slot ? 'hsl(258,85%,65%)' : 'hsl(222,20%,18%)'}`,
                        background: selectedTime === slot ? 'rgba(124,77,255,0.18)' : 'hsl(224,24%,5%)',
                        color: selectedTime === slot ? 'hsl(258,90%,78%)' : 'hsl(215,20%,78%)',
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                        boxShadow: selectedTime === slot ? '0 0 0 3px rgba(124,77,255,0.15)' : 'none',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {selectedTime && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: 16 }}>✓</span>
                    <span style={{ fontSize: 14, color: 'hsl(258,85%,72%)', fontWeight: 600 }}>Horário selecionado: {selectedTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Client data */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Nome completo *', value: clientName, onChange: setClientName, type: 'text', placeholder: 'Seu nome' },
              { label: 'WhatsApp / Telefone *', value: clientPhone, onChange: setClientPhone, type: 'tel', placeholder: '(11) 99999-9999' },
              { label: 'Email (opcional)', value: clientEmail, onChange: setClientEmail, type: 'email', placeholder: 'seu@email.com' },
            ].map((field) => (
              <div key={field.label}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'hsl(215,20%,65%)', marginBottom: '0.5rem' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 4 && (
          <div>
            <div style={{ background: 'hsl(224,24%,5%)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                ['Serviço', selectedService?.name],
                ['Profissional', selectedProfessional?.name],
                ['Data', selectedDate],
                ['Horário', selectedTime],
                ['Duração', `${selectedService?.duration_minutes} min`],
                ['Valor', `R$ ${((selectedService?.price ?? 0) / 100).toFixed(2)}`],
                ['Nome', clientName],
                ['Telefone', clientPhone],
                clientEmail ? ['Email', clientEmail] : null,
              ].filter((x): x is [string, string | undefined] => x !== null).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'hsl(215,14%,50%)' }}>{label}</span>
                  <span style={{ color: 'hsl(215,20%,88%)', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            {error && (
              <p style={{ color: '#f87171', fontSize: 13, marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', padding: '0.625rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(124,77,255,0.5)' : 'hsl(258,85%,65%)',
                color: '#fff',
                padding: '0.875rem',
                borderRadius: 10,
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Confirmando...' : 'Confirmar agendamento'}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{ background: 'hsl(222,20%,12%)', color: 'hsl(215,14%,65%)', padding: '0.625rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              ← Voltar
            </button>
          )}
          {step < 4 && step !== 0 && step !== 1 && (
            <button
              onClick={() => {
                if (step === 2 && (!selectedDate || !selectedTime)) { setError('Selecione data e horário.'); return }
                if (step === 3 && (!clientName || !clientPhone)) { setError('Preencha nome e telefone.'); return }
                setError(''); setStep(step + 1)
              }}
              style={{ background: 'hsl(258,85%,65%)', color: '#fff', padding: '0.625rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginLeft: 'auto' }}
            >
              Continuar →
            </button>
          )}
        </div>
        {error && step !== 4 && (
          <p style={{ color: '#f87171', fontSize: 13, marginTop: '0.75rem' }}>{error}</p>
        )}
      </div>
    </div>
  )
}
