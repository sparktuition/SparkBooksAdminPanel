import { useEffect, useState } from 'react'
import { db, storage } from '../firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'

type Book = { id?: string; title: string; description: string; fileUrl?: string }

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }))
      setBooks(items)
    })
    return () => unsub()
  }, [])

  const handleDelete = async (b: Book) => {
    if (!b.id) return
    if (!confirm('Delete book?')) return
    try {
      // If a storage url exists try removing the file (best-effort)
      if (b.fileUrl) {
        try {
          // derive ref from url - this assumes default bucket and path
          const storageRef = ref(storage, b.fileUrl)
          await deleteObject(storageRef)
        } catch (e) {
          // ignore storage deletion errors
        }
      }
      await deleteDoc(doc(db, 'books', b.id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    }
  }

  return (
    <div className="panel-content">
      <h3>Manage Books</h3>
      <ul className="list">
        {books.map((b) => (
          <li key={b.id} className="list-item">
            <div>
              <strong>{b.title}</strong>
              <p>{b.description}</p>
              {b.fileUrl ? <a href={b.fileUrl} target="_blank" rel="noreferrer">Open file</a> : null}
            </div>
            <div>
              <button onClick={() => handleDelete(b)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
