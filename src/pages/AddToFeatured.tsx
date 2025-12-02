import React, { useEffect, useState } from 'react'
import { db, ensureAuth } from '../firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import './AddToFeatured.css'

type Book = { id?: string; title: string }
type FeaturedCollection = { id?: string; name: string; books?: string[] }

type CollectionsByType = {
  featured: FeaturedCollection[]
  exclusive: FeaturedCollection[]
}

export default function AddToFeatured() {
  const [collections, setCollections] = useState<CollectionsByType>({ featured: [], exclusive: [] })
  const [books, setBooks] = useState<Book[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [collectionType, setCollectionType] = useState<'featured' | 'exclusive'>('featured')
  const [newCollectionName, setNewCollectionName] = useState<string>('')
  const [selectedBookIds, setSelectedBookIds] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // load featured and exclusive collections
    ;(async () => {
      try {
        const qf = query(collection(db, 'featuredCollections'), orderBy('name'))
        const qx = query(collection(db, 'exclusiveCollections'), orderBy('name'))
        const [sf, sx] = await Promise.all([getDocs(qf), getDocs(qx)])
        const itemsF = sf.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        const itemsX = sx.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        setCollections({ featured: itemsF, exclusive: itemsX })
      } catch (err) {
        console.error('Failed to load collections', err)
      }
    })()

    // load books
    ;(async () => {
      try {
        const q = query(collection(db, 'books'), orderBy('title'))
        const snap = await getDocs(q)
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        setBooks(items)
      } catch (err) {
        console.error('Failed to load books', err)
      }
    })()
  }, [])

  const toggleBook = (id?: string) => {
    if (!id) return
    setSelectedBookIds((s) => ({ ...s, [id]: !s[id] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ids = Object.keys(selectedBookIds).filter((k) => selectedBookIds[k])
    if (ids.length === 0) return alert('Select at least one book to add')
    if (!newCollectionName.trim() && !selectedCollectionId) return alert('Choose or enter a collection name')

    setLoading(true)
    try {
      await ensureAuth()

      const targetCollectionName = collectionType === 'featured' ? 'featuredCollections' : 'exclusiveCollections'

      if (newCollectionName.trim()) {
        await addDoc(collection(db, targetCollectionName), {
          name: newCollectionName.trim(),
          books: ids,
          createdAt: serverTimestamp(),
        })
        alert(`${collectionType === 'featured' ? 'Featured' : 'Exclusive'} collection created and books added`)
      } else {
        // update existing collection by adding book ids (using arrayUnion)
        const colDoc = doc(db, targetCollectionName, selectedCollectionId)
        for (const bid of ids) {
          await updateDoc(colDoc, { books: arrayUnion(bid) })
        }
        alert(`Books added to ${collectionType === 'featured' ? 'featured' : 'exclusive'} collection`)
      }

      // Reset
      setNewCollectionName('')
      setSelectedCollectionId('')
      setSelectedBookIds({})
      // reload collections list for both types
      const [sf, sx] = await Promise.all([
        getDocs(query(collection(db, 'featuredCollections'), orderBy('name'))),
        getDocs(query(collection(db, 'exclusiveCollections'), orderBy('name'))),
      ])
      setCollections({
        featured: sf.docs.map((d) => ({ id: d.id, ...(d.data() as any) })),
        exclusive: sx.docs.map((d) => ({ id: d.id, ...(d.data() as any) })),
      })
    } catch (err) {
      console.error(err)
      alert('Failed to add to featured collections')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-content">
      <h3>Add Books to Featured Collection</h3>
      <form className="form featured-form" onSubmit={handleSubmit}>
        <label>
          Collection Type
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ fontWeight: 500 }}>
              <input type="radio" name="ctype" checked={collectionType === 'featured'} onChange={() => setCollectionType('featured')} /> Featured
            </label>
            <label style={{ fontWeight: 500 }}>
              <input type="radio" name="ctype" checked={collectionType === 'exclusive'} onChange={() => setCollectionType('exclusive')} /> Exclusive
            </label>
          </div>
        </label>

        <label>
          Select Existing Collection ({collectionType === 'featured' ? 'Featured' : 'Exclusive'})
          <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)}>
            <option value="">-- choose an existing collection --</option>
            {(collectionType === 'featured' ? collections.featured : collections.exclusive).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <div style={{ textAlign: 'center', margin: '6px 0', color: '#666' }}>OR</div>

        <label>
          Create New Collection
          <input value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="New collection name" />
        </label>

        <label>
          Select Books
          <div className="books-list">
            {books.length === 0 ? (
              <div className="muted">No books available. Add books first.</div>
            ) : (
              books.map((b) => (
                <label key={b.id} className="book-checkbox">
                  <input type="checkbox" checked={!!selectedBookIds[b.id || '']} onChange={() => toggleBook(b.id)} />
                  <span>{b.title}</span>
                </label>
              ))
            )}
          </div>
        </label>

        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add to Featured'}</button>
        </div>
      </form>
    </div>
  )
}
