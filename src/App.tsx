import { useEffect, useState } from 'react'
import './App.css'
import AddBook from './pages/AddBook'
import AddToFeatured from './pages/AddToFeatured'
import AddEvent from './pages/AddEvent'
import ManageBooks from './pages/ManageBooks'
import ManageReviews from './pages/ManageReviews'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

type Page = 'add' | 'books' | 'reviews' | 'featured' | 'events'
type AuthView = 'login' | 'signup'

function App() {
  const [page, setPage] = useState<Page>('add')
  const [authed, setAuthed] = useState<boolean>(false)
  const [authView, setAuthView] = useState<AuthView>('login')
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthed(true)
        setUserEmail(user.email || '')
      } else {
        setAuthed(false)
        setUserEmail('')
      }
    })
    return () => unsub()
  }, [])

  async function handleLogout() {
    await signOut(auth)
    setAuthView('login')
  }

  if (!authed) {
    return (
      <div className="admin-root">
        <header className="topbar">
          <h1 className="brand">SparkBooks Admin</h1>
        </header>
        <main className="main-area">
          <section className="content">
            {authView === 'login' ? (
              <Login
                onLogin={(email) => { setAuthed(true); setUserEmail(email) }}
                goSignup={() => setAuthView('signup')}
              />
            ) : (
              <Signup
                onSignup={(email) => { setAuthed(true); setUserEmail(email) }}
                goLogin={() => setAuthView('login')}
              />
            )}
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-root">
      <header className="topbar">
        <h1 className="brand">SparkBooks Admin</h1>
        <nav className="topnav">
          <button className={page === 'add' ? 'active' : ''} onClick={() => setPage('add')}>Add Book</button>
          <button className={page === 'featured' ? 'active' : ''} onClick={() => setPage('featured')}>Add To Collections</button>
          <button className={page === 'events' ? 'active' : ''} onClick={() => setPage('events')}>Add Event</button>
          <button className={page === 'books' ? 'active' : ''} onClick={() => setPage('books')}>Manage Books</button>
          <button className={page === 'reviews' ? 'active' : ''} onClick={() => setPage('reviews')}>Manage Reviews</button>
          <button onClick={handleLogout}>Logout{userEmail ? ` (${userEmail})` : ''}</button>
        </nav>
      </header>

      <main className="main-area">
        <aside className="sidebar">
          <ul>
            <li><button className={page === 'add' ? 'active' : ''} onClick={() => setPage('add')}>Add Book</button></li>
            <li><button className={page === 'featured' ? 'active' : ''} onClick={() => setPage('featured')}>Add To Collections</button></li>
            <li><button className={page === 'events' ? 'active' : ''} onClick={() => setPage('events')}>Add Event</button></li>
            <li><button className={page === 'books' ? 'active' : ''} onClick={() => setPage('books')}>Manage Books</button></li>
            <li><button className={page === 'reviews' ? 'active' : ''} onClick={() => setPage('reviews')}>Manage Reviews</button></li>
          </ul>
        </aside>

        <section className="content">
          {page === 'add' && <AddBook />}
          {page === 'featured' && <AddToFeatured />}
          {page === 'events' && <AddEvent />}
          {page === 'books' && <ManageBooks />}
          {page === 'reviews' && <ManageReviews />}
        </section>
      </main>
    </div>
  )
}

export default App
