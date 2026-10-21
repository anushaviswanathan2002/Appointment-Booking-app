import { useState, useMemo, useEffect } from 'react'

const SERVICES = [
  { id: 1, name: 'Doctor Consultation', duration: 30, emoji: '🩺' },
  { id: 2, name: 'Hair Salon', duration: 45, emoji: '💇' },
  { id: 3, name: 'Dental Checkup', duration: 30, emoji: '🦷' },
  { id: 4, name: 'Massage Therapy', duration: 60, emoji: '💆' },
  { id: 5, name: 'Personal Training', duration: 45, emoji: '🏋️' },
  { id: 6, name: 'Eye Exam', duration: 30, emoji: '👁️' },
]

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]

const STORAGE_KEY = 'bookit-appointments'
const THEME_KEY = 'bookit-theme'

function loadAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark'
}

export default function App() {
  const [service, setService] = useState(null)
  const [date, setDate] = useState(todayISO())
  const [slot, setSlot] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [appointments, setAppointments] = useState(loadAppointments)
  const [lastBooked, setLastBooked] = useState(null)
  const [dark, setDark] = useState(loadTheme)

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  const bookedKeys = useMemo(
    () => new Set(appointments.map((a) => `${a.date}-${a.slot}`)),
    [appointments],
  )

  const persist = (next) => {
    setAppointments(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const canBook =
    service && slot && date && name.trim() && email.includes('@')

  const submit = (e) => {
    e.preventDefault()
    if (!canBook) return
    const appt = {
      id: Date.now(),
      serviceId: service.id,
      serviceName: service.name,
      emoji: service.emoji,
      date,
      slot,
      name,
      email,
    }
    persist([appt, ...appointments])
    setLastBooked(appt)
    setSlot(null)
    setName('')
    setEmail('')
  }

  const cancel = (id) => {
    persist(appointments.filter((a) => a.id !== id))
  }

  return (
    <div className="app">
      <header>
        <div className="header-row">
          <div>
            <h1>📅 BookIt</h1>
            <p>Schedule your next appointment in seconds</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="card">
        <h2>1. Choose a Service</h2>
        <div className="services">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className={`service ${service?.id === s.id ? 'selected' : ''}`}
              onClick={() => setService(s)}
            >
              <div className="emoji">{s.emoji}</div>
              <div className="name">{s.name}</div>
              <div className="meta">{s.duration} min</div>
            </div>
          ))}
        </div>
      </div>

      {service && (
        <div className="card">
          <h2>2. Pick a Date & Time</h2>
          <div className="form-row">
            <label>Date</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => {
                setDate(e.target.value)
                setSlot(null)
              }}
            />
          </div>
          <div className="form-row">
            <label>Available Slots</label>
            <div className="slot-grid">
              {TIME_SLOTS.map((t) => {
                const key = `${date}-${t}`
                const taken = bookedKeys.has(key)
                return (
                  <button
                    key={t}
                    type="button"
                    className={`slot ${slot === t ? 'selected' : ''} ${
                      taken ? 'booked' : ''
                    }`}
                    disabled={taken}
                    onClick={() => setSlot(t)}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {service && slot && (
        <div className="card">
          <h2>3. Your Details</h2>
          <form onSubmit={submit}>
            <div className="form-row">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
              />
            </div>
            <button className="confirm-btn" type="submit" disabled={!canBook}>
              Confirm Booking
            </button>
          </form>
        </div>
      )}

      {lastBooked && (
        <div className="confirmation">
          <div className="check">✅</div>
          <h3>Booking Confirmed!</h3>
          <p>
            {lastBooked.serviceName} on {lastBooked.date} at {lastBooked.slot}
          </p>
          <p>A confirmation has been sent to {lastBooked.email}.</p>
        </div>
      )}

      <div className="card">
        <h2>Your Appointments</h2>
        {appointments.length === 0 ? (
          <p className="empty-state">No appointments yet.</p>
        ) : (
          <ul className="appointments-list">
            {appointments.map((a) => (
              <li key={a.id}>
                <div className="info">
                  <h4>
                    {a.emoji} {a.serviceName}
                  </h4>
                  <p>
                    {a.date} at {a.slot} — {a.name}
                  </p>
                </div>
                <button className="cancel-btn" onClick={() => cancel(a.id)}>
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
