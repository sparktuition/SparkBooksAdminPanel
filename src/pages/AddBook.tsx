import React, { useState } from 'react'
import { storage, db, auth, ensureAuth } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './AddBook.css'

export default function AddBook() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0]
      setImage(imageFile)
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(imageFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return alert('Title and description required')
    
    setLoading(true)
    try {
      // Ensure user is authenticated and get fresh token before attempting upload
      await ensureAuth()
      
      // Get current user and wait for token refresh to ensure auth token is attached
      const currentUser = auth.currentUser
      if (!currentUser) {
        alert('Authentication failed. Please try again.')
        setLoading(false)
        return
      }
      
      // Force token refresh to ensure it's attached to the next request
      await currentUser.getIdToken(true)
      
      let fileUrl: string | null = null
      if (file) {
        const storageRef = ref(storage, `books/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        fileUrl = await getDownloadURL(storageRef)
      }

      let imageUrl: string | null = null
      if (image) {
        const imageRef = ref(storage, `book-images/${Date.now()}_${image.name}`)
        await uploadBytes(imageRef, image)
        imageUrl = await getDownloadURL(imageRef)
      }

      await addDoc(collection(db, 'books'), {
        title,
        description,
        fileUrl,
        imageUrl,
        createdAt: serverTimestamp(),
      })

      setTitle('')
      setDescription('')
      setFile(null)
      setImage(null)
      setImagePreview('')
      const fileInput = document.getElementById('add-file') as HTMLInputElement | null
      if (fileInput) fileInput.value = ''
      const imageInput = document.getElementById('add-image') as HTMLInputElement | null
      if (imageInput) imageInput.value = ''
      alert('Book added successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to add book: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-content">
      <h3>Add Book</h3>
      <form onSubmit={handleSubmit} className="form add-book-form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter book title" />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter book description" />
        </label>
        <label>
          Book Image
          <input id="add-image" type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </label>
        <label>
          Book File (PDF, EPUB, etc.)
          <input id="add-file" type="file" onChange={handleFileChange} />
        </label>
        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Book'}</button>
        </div>
      </form>
    </div>
  )
}
