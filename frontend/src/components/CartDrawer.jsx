import { useStore } from '../context/StoreContext'
import { formatINR } from '../utils/Format'
import ProductIllustration from './ProductIllustration'

const CartDrawer = () => {
  const {
    cartOpen,
    setCartOpen,
    cart,
    cartCount,
    removeFromCart,
    updateQty,
    cartSubtotal,
    cartSavings,
    delivery,
    cartTotal,
    openCheckout,
  } = useStore()

  if (!cartOpen) return null

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setCartOpen(false)
      }}
    >
      <aside
        className="bg-white h-100 position-absolute top-0 end-0 d-flex flex-column shadow-lg"
        style={{ width: '100%', maxWidth: 420, animation: 'slideIn .25s ease' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div>
            <h2 className="h5 fw-bold mb-0">Your Cart</h2>
            <p className="small text-secondary mb-0">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setCartOpen(false)}
          />
        </div>

        <div className="flex-fill p-4" style={{ overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-3"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              <p className="fw-semibold mb-1">Your cart is empty</p>
              <p className="small text-secondary mb-3">Add some furniture to get started.</p>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="btn btn-primary btn-sm fw-semibold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
              {cart.map((item) => (
                <li key={item.id} className="d-flex gap-3 pb-3 border-bottom">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 72, height: 72, background: item.bg }}
                  >
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-100 h-100 rounded-3"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <ProductIllustration color={item.color} size={48} />
                    )}
                  </div>

                  <div className="flex-fill min-w-0">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div className="min-w-0">
                        <p className="small text-secondary mb-0">{item.category}</p>
                        <p className="fw-semibold mb-1 small text-truncate">{item.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-sm btn-link text-danger p-0"
                        aria-label="Remove"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        </svg>
                      </button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="d-flex align-items-center border rounded-3">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="btn btn-sm px-2 py-0 fw-bold"
                        >
                          −
                        </button>
                        <span className="px-2 small fw-semibold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          className="btn btn-sm px-2 py-0 fw-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-end">
                        <p className="fw-bold mb-0 small">{formatINR(item.price * item.qty)}</p>
                        <p
                          className="text-secondary small mb-0 text-decoration-line-through"
                          style={{ fontSize: 11 }}
                        >
                          {formatINR(item.oldPrice * item.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-top p-4 bg-light">
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-secondary">Subtotal</span>
              <span className="fw-semibold">{formatINR(cartSubtotal)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-secondary">You save</span>
              <span className="fw-semibold text-success">− {formatINR(cartSavings)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-3">
              <span className="text-secondary">Delivery</span>
              <span className="fw-semibold">{delivery === 0 ? 'Free' : formatINR(delivery)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-baseline border-top pt-3 mb-3">
              <span className="fw-semibold">Total</span>
              <span className="fs-5 fw-bold text-primary">{formatINR(cartTotal)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false)
                openCheckout()
              }}
              className="btn btn-primary w-100 fw-semibold"
            >
              Proceed to Checkout
            </button>
            {delivery > 0 && (
              <p className="small text-secondary text-center mt-2 mb-0">
                Free delivery on orders above ₹25,000
              </p>
            )}
          </div>
        )}
      </aside>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default CartDrawer
