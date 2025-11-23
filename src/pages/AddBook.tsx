import React, { useState } from 'react'
import { storage, db, auth } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function AddBook() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return alert('Title and description required')
    if (!auth.currentUser) {
      alert('Please login to add a book')
      return
    }
    setLoading(true)
    try {
      let fileUrl: string | null = null
      if (file) {
        const storageRef = ref(storage, `books/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        fileUrl = await getDownloadURL(storageRef)
      }

      await addDoc(collection(db, 'books'), {
        title,
        description,
        fileUrl,
        createdAt: serverTimestamp(),
      })

      setTitle('')
      setDescription('')
      setFile(null)
      const el = document.getElementById('add-file') as HTMLInputElement | null
      if (el) el.value = ''
      alert('Book added')
    } catch (err) {
      console.error(err)
      alert('Failed to add book')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-content">
      <h3>Add Book</h3>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          File (optional)
          <input id="add-file" type="file" onChange={handleFileChange} />
        </label>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Book'}</button>
        </div>
      </form>
    </div>
  )
}
