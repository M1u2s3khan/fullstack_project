import { useStore } from '../context/StoreContext'

const AuthModal = () => {
  const {
    authMode,
    closeAuth,
    openAuth,
    authForm,
    setAuthForm,
    authError,
    isSubmitting,
    handleAuthSubmit,
  } = useStore()

  if (!authMode) return null

  const switchMode = (mode) => {
    closeAuth()
    setTimeout(() => openAuth(mode), 50)
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 1300, backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeAuth()
      }}
    >
      <section
        className="card border-0 shadow-lg rounded-4 w-100"
        style={{ maxWidth: 440 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div className="card-body p-4 p-sm-5">
          <div className="d-flex align-items-start justify-content-between mb-4">
            <div>
              <h2 id="auth-title" className="h3 fw-bold mb-1">
                {authMode === 'signup' ? 'Join HomeCraft' : 'Welcome back'}
              </h2>
              <p className="text-secondary mb-0">
                {authMode === 'signup'
                  ? 'Sign up and unlock ₹2,000 off your first order.'
                  : 'Log in to track orders and wishlist.'}
              </p>
            </div>
            <button type="button" className="btn-close" aria-label="Close" onClick={closeAuth} />
          </div>

          <form onSubmit={handleAuthSubmit}>
            {authMode === 'signup' && (
              <div className="mb-3">
                <label htmlFor="auth-name" className="form-label">
                  Name
                </label>
                <input
                  id="auth-name"
                  className="form-control"
                  autoComplete="name"
                  maxLength={80}
                  required
                  value={authForm.name}
                  onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                />
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="auth-email" className="form-label">
                Email
              </label>
              <input
                id="auth-email"
                className="form-control"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={authForm.email}
                onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="auth-password" className="form-label">
                Password
              </label>
              <input
                id="auth-password"
                className="form-control"
                type="password"
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                minLength={8}
                maxLength={128}
                required
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
              />
              {authMode === 'signup' && <div className="form-text">Use 8 to 128 characters.</div>}
            </div>
            {authMode === 'signup' && (
              <div className="mb-3">
                <label htmlFor="auth-confirm-password" className="form-label">
                  Confirm password
                </label>
                <input
                  id="auth-confirm-password"
                  className="form-control"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={authForm.confirmPassword}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, confirmPassword: event.target.value })
                  }
                />
              </div>
            )}

            {authError && (
              <div className="alert alert-danger py-2" role="alert">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="small text-center text-secondary mt-4 mb-0">
            {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => switchMode(authMode === 'signup' ? 'login' : 'signup')}
              className="btn btn-link p-0 fw-semibold text-primary align-baseline"
            >
              {authMode === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}

export default AuthModal
