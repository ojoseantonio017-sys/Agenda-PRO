export interface Company {
  id: string
  name: string
  slug: string
  plan: string
  active: boolean
  created_at: string
  whatsapp?: string
  email?: string
  logo_url?: string
}

export interface Professional {
  id: string
  company_id: string
  name: string
  bio?: string
  avatar_url?: string
  active: boolean
}

export interface Service {
  id: string
  company_id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  active: boolean
}

export interface Appointment {
  id: string
  company_id: string
  professional_id: string
  service_id: string
  client_name: string
  client_phone: string
  client_email?: string
  date: string
  start_time: string
  end_time: string
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  notes?: string
  payment_method?: 'presencial' | 'online'
  payment_status?: 'pendente' | 'pago'
  created_at: string
}

export interface User {
  id: string
  company_id: string
  name: string
  email: string
  role: 'admin' | 'professional'
  active: boolean
}

export interface WorkingHours {
  id: string
  professional_id: string
  day_of_week: number // 0=domingo, 6=sábado
  start_time: string
  end_time: string
  active: boolean
}
