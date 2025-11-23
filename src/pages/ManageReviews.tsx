import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'

type Review = { id?: string; author?: string; text: string; bookId?: string }

export default function ManageReviews() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }))
      setReviews(items)
    })
    return () => unsub()
  }, [])

  const handleDelete = async (id?: string) => {
    if (!id) return
    if (!confirm('Delete review?')) return
    try {
      await deleteDoc(doc(db, 'reviews', id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    }
  }

  return (
    <div className="panel-content">
      <h3>Manage Reviews</h3>
      <ul className="list">
        {reviews.map((r) => (
          <li key={r.id} className="list-item">
            <div>
              <strong>{r.author || 'Anonymous'}</strong>
              <p>{r.text}</p>
              {r.bookId ? <small>Book: {r.bookId}</small> : null}
            </div>
            <div>
              <button onClick={() => handleDelete(r.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
