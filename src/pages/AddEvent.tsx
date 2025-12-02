import React, { useState } from 'react'
import { db, ensureAuth } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './AddEvent.css'

export default function AddEvent() {
  const [title, setTitle] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !eventTime) return alert('Title and event time are required')

    setLoading(true)
    try {
      await ensureAuth()

      // convert eventTime input (datetime-local) to JS Date
      const eventDate = eventTime ? new Date(eventTime) : null

      await addDoc(collection(db, 'events'), {
        title: title.trim(),
        description: description.trim(),
        eventTime: eventDate,
        createdAt: serverTimestamp(),
      })

      // reset
      setTitle('')
      setEventTime('')
      setDescription('')

      alert('Event created successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-content">
      <h3>Add Upcoming Event</h3>
      <form className="form add-event-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
        </label>

        <label>
          Time
          <input type="datetime-local" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description" />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Event'}</button>
        </div>
      </form>
    </div>
  )
}
