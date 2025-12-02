import { useEffect, useState } from 'react'
import { db, storage } from '../firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import './ManageBooks.css'

type Book = { id?: string; title: string; description: string; fileUrl?: string; imageUrl?: string }

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)

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
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) return
    try {
      setLoading(true)
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
      // Also try to delete the image if it exists
      if (b.imageUrl) {
        try {
          const imageRef = ref(storage, b.imageUrl)
          await deleteObject(imageRef)
        } catch (e) {
          // ignore storage deletion errors
        }
      }
      await deleteDoc(doc(db, 'books', b.id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete book. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-content">
      <h3>📚 Manage Books</h3>
      {books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No books yet</p>
          <p style={{ fontSize: '0.9rem' }}>Add a book from the "Add Book" section to get started</p>
        </div>
      ) : (
        <ul className="list book-list">
          {books.map((b) => (
            <li key={b.id} className="list-item book-item">
              {b.imageUrl && (
                <div className="book-image-container">
                  <img src={b.imageUrl} alt={b.title} className="book-image" />
                </div>
              )}
              <div className="book-details">
                <strong>{b.title}</strong>
                <p>{b.description}</p>
                <div className="book-links">
                  {b.fileUrl ? <a href={b.fileUrl} target="_blank" rel="noreferrer">📄 View Book</a> : null}
                </div>
              </div>
              <div className="book-actions">
                <button onClick={() => handleDelete(b)} disabled={loading}>
                  {loading ? '🗑️ Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
