import { createContext, useContext, useEffect, useState } from 'react'

const StoreContext = createContext(null)

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    let script = document.getElementById('razorpay-checkout')
    if (!script) {
      script = document.createElement('script')
      script.id = 'razorpay-checkout'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
    }
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener(
      'error',
      () => {
        script.remove()
        reject(new Error('Razorpay checkout could not be loaded. Check your internet connection.'))
      },
      { once: true },
    )
    if (!script.isConnected) document.head.appendChild(script)
  })
}

export const StoreProvider = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authMode, setAuthMode] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    payment: 'cod',
  })
  const [orderPlaced, setOrderPlaced] = useState(null)

  // Session check on mount
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) return null
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Session could not be verified.')
        return data.user
      })
      .then((user) => {
        if (user) setCurrentUser(user)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('Session lookup failed:', error)
      })
    return () => controller.abort()
  }, [])

  // Lock body scroll when modal/drawer open
  useEffect(() => {
    const anyOpen = cartOpen || checkoutOpen || !!selectedProduct || !!authMode
    document.body.style.overflow = anyOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [cartOpen, checkoutOpen, selectedProduct, authMode])

  // Cart totals
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartOriginal = cart.reduce((s, i) => s + i.oldPrice * i.qty, 0)
  const cartSavings = cartOriginal - cartSubtotal
  const delivery = cartSubtotal > 25000 ? 0 : 499
  const cartTotal = cartSubtotal + (cart.length > 0 ? delivery : 0)

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthError('')
    setAuthNotice('')
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
  }
  const closeAuth = () => setAuthMode(null)

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')

    if (authMode === 'signup' && authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Authentication failed.')

      setCurrentUser(data.user)
      setAuthNotice(
        authMode === 'signup'
          ? 'Account created — welcome to HomeCraft!'
          : 'Logged in successfully.',
      )
      setAuthMode(null)
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
    } catch (error) {
      setAuthError(error.message || 'Could not connect to the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Logout failed.')
      setCurrentUser(null)
      setAuthNotice('Logged out successfully.')
    } catch (error) {
      setAuthError(error.message || 'Logout failed. Please try again.')
    }
  }

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { ...product, qty }]
    })
    setAuthNotice(`${product.name} added to cart.`)
  }

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)),
    )
  }

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const openCheckout = () => {
    if (cart.length === 0) return
    setCheckoutOpen(true)
    setCheckoutStep(1)
    setOrderPlaced(null)
    setOrderError('')
    if (currentUser) {
      setCheckoutData((d) => ({
        ...d,
        fullName: currentUser.name || d.fullName,
      }))
    }
  }

  const handlePlaceOrder = async () => {
    if (isPlacingOrder || cart.length === 0) return

    setIsPlacingOrder(true)
    setOrderError('')
    try {
      const orderDetails = {
        ...checkoutData,
        items: cart.map(({ id, qty }) => ({ id, qty })),
      }
      let order

      if (checkoutData.payment === 'razorpay') {
        await loadRazorpay()
        const response = await fetch('/api/orders/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderDetails),
        })
        const gatewayOrder = await response.json()
        if (!response.ok) {
          throw new Error(gatewayOrder.message || 'Online payment could not be started.')
        }

        order = await new Promise((resolve, reject) => {
          let settled = false
          const finish = (callback, value) => {
            if (settled) return
            settled = true
            callback(value)
          }

          const checkout = new window.Razorpay({
            key: gatewayOrder.keyId,
            amount: gatewayOrder.amount,
            currency: gatewayOrder.currency,
            name: 'A To Z Furniture',
            description: `Order ${gatewayOrder.orderId}`,
            order_id: gatewayOrder.razorpayOrderId,
            prefill: {
              name: checkoutData.fullName,
              contact: checkoutData.phone,
            },
            theme: { color: '#4f46e5' },
            handler: async (paymentResponse) => {
              try {
                const verificationResponse = await fetch('/api/orders/razorpay/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(paymentResponse),
                })
                const verification = await verificationResponse.json()
                if (!verificationResponse.ok) {
                  throw new Error(
                    verification.message || 'Payment verification failed. Please contact support.',
                  )
                }
                finish(resolve, verification.order)
              } catch (error) {
                finish(reject, error)
              }
            },
            modal: {
              ondismiss: () =>
                finish(reject, new Error('Payment was cancelled. Your cart is unchanged.')),
            },
          })
          checkout.on('payment.failed', (failure) => {
            finish(
              reject,
              new Error(failure.error?.description || 'Payment failed. Please try again.'),
            )
          })
          checkout.open()
        })
      } else {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...orderDetails, payment: 'cod' }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Your order could not be placed.')
        }
        order = data.order
      }

      setOrderPlaced({
        ...order,
        date: new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN'),
      })
      setCheckoutStep(3)
      setCart([])
    } catch (error) {
      console.error('Order placement failed:', error)
      setOrderError(error.message || 'Could not connect to the server. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const value = {
    menuOpen,
    setMenuOpen,
    authMode,
    openAuth,
    closeAuth,
    currentUser,
    handleLogout,
    authForm,
    setAuthForm,
    authError,
    setAuthError,
    authNotice,
    setAuthNotice,
    isSubmitting,
    handleAuthSubmit,
    activeCategory,
    setActiveCategory,
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    cartCount,
    cartSubtotal,
    cartSavings,
    delivery,
    cartTotal,
    wishlist,
    toggleWishlist,
    selectedProduct,
    setSelectedProduct,
    cartOpen,
    setCartOpen,
    checkoutOpen,
    setCheckoutOpen,
    checkoutStep,
    setCheckoutStep,
    checkoutData,
    setCheckoutData,
    orderPlaced,
    handlePlaceOrder,
    isPlacingOrder,
    orderError,
    openCheckout,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
