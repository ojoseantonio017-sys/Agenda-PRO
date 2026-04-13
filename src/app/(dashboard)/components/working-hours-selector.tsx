'use client'

import { useState } from 'react'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

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

      {/* Inputs de horário para dias ativos */}
      {sortedActive.length === 0 && (
        <p style={{ fontSize: 12, color: 'hsl(215,14%,38%)', fontStyle: 'italic' }}>
          Clique nos dias para configurar os horários.
        </p>
      )}
      {sortedActive.map((day) => (
        <div key={day} style={{ display: 'grid', gridTemplateColumns: '2.75rem 1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: 12, color: 'hsl(258,85%,72%)', fontWeight: 700 }}>{DAYS[day]}</span>
          <input
            type="time"
            name={`start_${day}`}
            value={times[day]?.start ?? ''}
            onChange={(e) => setTime(day, 'start', e.target.value)}
            className="input"
            style={{ padding: '0.4rem 0.5rem', fontSize: 13 }}
          />
          <span style={{ fontSize: 12, color: 'hsl(215,14%,40%)', textAlign: 'center' }}>até</span>
          <input
            type="time"
            name={`end_${day}`}
            value={times[day]?.end ?? ''}
            onChange={(e) => setTime(day, 'end', e.target.value)}
            className="input"
            style={{ padding: '0.4rem 0.5rem', fontSize: 13 }}
          />
        </div>
      ))}
    </div>
  )
}
