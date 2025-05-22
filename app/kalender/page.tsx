'use client'

import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function KalenderPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kalender</h1>

      <Calendar onClickDay={setSelectedDate} />

      {selectedDate && (
        <div className="mt-4">
          <p>Geselecteerde dag: <strong>{selectedDate.toDateString()}</strong></p>
          {/* Hier komt straks het formulier voor tijd/club */}
        </div>
      )}
    </div>
  )
}
