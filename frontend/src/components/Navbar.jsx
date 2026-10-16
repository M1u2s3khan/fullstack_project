import { navLinks } from '../data/Constants'
import { useStore } from '../context/StoreContext'

const Navbar = () => {
  const {
    menuOpen,
    setMenuOpen,
    cartCount,
    wishlist,
    setCartOpen,
    currentUser,
    handleLogout,
    openAuth,
  } = useStore()

  const goAuth = (mode) => {
    openAuth(mode)
    setMenuOpen(false)
  }

  return (
    <header
      className="sticky-top bg-white bg-opacity-75 border-bottom"
      style={{ backdropFilter: 'blur(10px)', zIndex: 1030 }}
    >
      <nav className="container d-flex align-items-center justify-content-between py-3">
        {/* Logo */}
        <a
          href="/"
          className="d-flex align-items-center gap-2 text-decoration-none fw-bold text-dark fs-5"
        >
          <span
            className="d-grid bg-primary text-white rounded-3"
            style={{ width: 36, height: 36, placeItems: 'center' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </span>
          HomeCraft
        </a>

        {/* Desktop links */}
        <ul className="d-none d-lg-flex align-items-center gap-4 list-unstyled mb-0 small fw-medium text-secondary">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="text-decoration-none text-secondary link-primary">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right actions */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="btn btn-link text-secondary position-relative p-1"
            aria-label="Wishlist"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            {wishlist.length > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: 10 }}
              >
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="btn btn-link text-secondary position-relative p-1"
            aria-label="Cart"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                style={{ fontSize: 10 }}
              >
                {cartCount}
              </span>
            )}
          </button>

          <div className="vr d-none d-md-block" style={{ height: 24 }} />

          {currentUser ? (
            <>
              <span className="small text-secondary">Hi, {currentUser.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-secondary btn-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => goAuth('login')}
                className="btn btn-link text-decoration-none text-secondary fw-semibold btn-sm"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => goAuth('signup')}
                className="btn btn-primary btn-sm fw-semibold px-3"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="btn btn-light d-md-none"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-top bg-white p-3 d-md-none">
          <ul className="list-unstyled d-flex flex-column gap-1 mb-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="d-block px-3 py-2 rounded text-secondary text-decoration-none small fw-medium"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="d-flex flex-column gap-2">
            {currentUser ? (
              <>
                <span className="small text-secondary text-center">Hi, {currentUser.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => goAuth('login')}
                  className="btn btn-outline-secondary btn-sm fw-semibold"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => goAuth('signup')}
                  className="btn btn-primary btn-sm fw-semibold"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
