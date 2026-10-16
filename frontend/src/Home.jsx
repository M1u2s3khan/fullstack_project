import { useStore } from './context/StoreContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import Products from './components/Products'
import Stats from './components/Stats'
import CTA from './components/CTA'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import AuthModal from './components/AuthModal'
import Footer from './components/Footer'

const Home = () => {
  const { authNotice, setAuthNotice, authError, setAuthError, authMode } = useStore()

  return (
    <div className="bg-light text-dark min-vh-100">
      <Navbar />

      {authNotice && !authMode && (
        <div className="container mt-3">
          <div className="alert alert-success alert-dismissible mb-0" role="status">
            {authNotice}
            <button
              type="button"
              className="btn-close"
              aria-label="Dismiss"
              onClick={() => setAuthNotice('')}
            />
          </div>
        </div>
      )}

      {authError && !authMode && (
        <div className="container mt-3">
          <div className="alert alert-danger alert-dismissible mb-0" role="alert">
            {authError}
            <button
              type="button"
              className="btn-close"
              aria-label="Dismiss"
              onClick={() => setAuthError('')}
            />
          </div>
        </div>
      )}

      <Hero />
      <Categories />
      <Products />
      <Stats />
      <CTA />
      <Footer />

      {/* Modals & Drawers */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <AuthModal />
    </div>
  )
}

export default Home
