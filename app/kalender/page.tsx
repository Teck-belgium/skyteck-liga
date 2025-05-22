'use client'

import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function KalenderPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vliegkalender</h1>

      {/* 📅 Kalender */}
      <Calendar
        onClickDay={(date) => setSelectedDate(date)}
        value={selectedDate}
      />

      {/* 📋 Formulier tonen als er een datum geselecteerd is */}
      {selectedDate && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">
            Aanwezigheid voor: {selectedDate.toLocaleDateString()}
          </h2>

          {/* Tijdstippen en club-keuze hier */}
          <form className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Begintijd</label>
              <input
                type="time"
                className="border px-3 py-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Eindtijd</label>
              <input
                type="time"
                className="border px-3 py-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Club</label>
              <select className="border px-3 py-2 rounded w-full">
                <option>Keuze uit clubs…</option>
                {/* Later dynamisch maken met clubs van de gebruiker */}
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Opslaan
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
