'use client'

import { useState } from 'react'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// 30-min intervals from 06:00 to 22:00
const TIMES: string[] = []
for (let h = 6; h <= 22; h++) {
  TIMES.push(`${String(h).padStart(2, '0')}:00`)
  if (h < 22) TIMES.push(`${String(h).padStart(2, '0')}:30`)
}

interface WorkingHour {
  day_of_week: number
  start_time: string
  end_time: string
  active: boolean
}

interface Props {
  initialHours?: WorkingHour[]
}

export default function WorkingHoursSelector({ initialHours = [] }: Props) {
  const [activeDays, setActiveDays] = useState<Set<number>>(
    new Set(initialHours.filter((h) => h.active).map((h) => h.day_of_week))
  )
  const [times, setTimes] = useState<Record<number, { start: string; end: string }>>(
    Object.fromEntries(
      initialHours.map((h) => [h.day_of_week, {
        start: h.start_time?.slice(0, 5) ?? '',
        end:   h.end_time?.slice(0, 5)   ?? '',
      }])
    )
  )

  const toggle = (day: number) => {
    setActiveDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  const setTime = (day: number, field: 'start' | 'end', value: string) => {
    setTimes((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  const sortedActive = Array.from(activeDays).sort((a, b) => a - b)

  return (
    <div>
      {/* Chips de dias */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {DAYS.map((day, i) => {
          const on = activeDays.has(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: 8,
                border: `1.5px solid ${on ? 'hsl(258,85%,65%)' : 'hsl(222,20%,18%)'}`,
                background: on ? 'rgba(124,77,255,0.18)' : 'hsl(224,24%,5%)',
                color: on ? 'hsl(258,90%,78%)' : 'hsl(215,14%,48%)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: on ? '0 0 0 3px rgba(124,77,255,0.1)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      {sortedActive.length === 0 && (
        <p style={{ fontSize: 12, color: 'hsl(215,14%,38%)', fontStyle: 'italic' }}>
          Clique nos dias para configurar os horários.
        </p>
      )}

      {/* Seletor de horário para cada dia ativo */}
      {sortedActive.map((day) => {
        const selectedStart = times[day]?.start ?? ''
        const selectedEnd   = times[day]?.end   ?? ''
        return (
          <div
            key={day}
            style={{
              marginBottom: '0.875rem',
              background: 'hsl(224,24%,6%)',
              borderRadius: 10,
              padding: '0.875rem',
              border: '1px solid hsl(222,20%,13%)',
            }}
          >
            {/* Hidden inputs para o server action */}
            <input type="hidden" name={`start_${day}`} value={selectedStart} />
            <input type="hidden" name={`end_${day}`}   value={selectedEnd} />

            <div style={{ fontSize: 12, fontWeight: 700, color: 'hsl(258,85%,72%)', marginBottom: '0.75rem' }}>
              {DAYS[day]}
              {selectedStart && selectedEnd && (
                <span style={{ marginLeft: '0.5rem', fontWeight: 500, color: 'hsl(215,14%,50%)', fontSize: 11 }}>
                  {selectedStart} – {selectedEnd}
                </span>
              )}
            </div>

            {/* Início */}
            <div style={{ marginBottom: '0.625rem' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'hsl(215,14%,42%)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Início
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {TIMES.map((t) => {
                  const on = selectedStart === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(day, 'start', t)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: 6,
                        border: `1px solid ${on ? 'hsl(258,85%,65%)' : 'hsl(222,20%,16%)'}`,
                        background: on ? 'rgba(124,77,255,0.22)' : 'hsl(224,24%,4%)',
                        color: on ? 'hsl(258,90%,80%)' : 'hsl(215,14%,45%)',
                        fontSize: 11,
                        fontWeight: on ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                        boxShadow: on ? '0 0 0 2px rgba(124,77,255,0.12)' : 'none',
                      }}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Fim */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'hsl(215,14%,42%)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Fim
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {TIMES.map((t) => {
                  const on = selectedEnd === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(day, 'end', t)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: 6,
                        border: `1px solid ${on ? 'hsl(258,85%,65%)' : 'hsl(222,20%,16%)'}`,
                        background: on ? 'rgba(124,77,255,0.22)' : 'hsl(224,24%,4%)',
                        color: on ? 'hsl(258,90%,80%)' : 'hsl(215,14%,45%)',
                        fontSize: 11,
                        fontWeight: on ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                        boxShadow: on ? '0 0 0 2px rgba(124,77,255,0.12)' : 'none',
                      }}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
