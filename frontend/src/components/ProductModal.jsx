import { useStore } from '../context/StoreContext'
import { formatINR } from '../utils/Format'
import ProductIllustration from './ProductIllustration'
import Stars from './Stars'

const ProductModal = () => {
  const { selectedProduct, setSelectedProduct, wishlist, toggleWishlist, addToCart, setCartOpen } =
    useStore()

  if (!selectedProduct) return null

  const p = selectedProduct

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedProduct(null)
      }}
    >
      <section
        className="card border-0 shadow-lg rounded-4 w-100 overflow-hidden"
        style={{ maxWidth: 860, maxHeight: '90vh' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="row g-0">
          <div
            className="col-12 col-md-6 d-flex align-items-center justify-content-center position-relative"
            style={{ background: p.bg, minHeight: 320 }}
          >
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3 d-md-none"
              aria-label="Close"
              onClick={() => setSelectedProduct(null)}
            />
            {p.img ? (
              <img
                src={p.img}
                alt={p.name}
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <ProductIllustration color={p.color} size={220} />
            )}
            {p.badge && (
              <span className="position-absolute top-0 start-0 m-3 badge bg-dark text-white">
                {p.badge}
              </span>
            )}
          </div>

          <div className="col-12 col-md-6">
            <div
              className="p-4 p-md-5 position-relative"
              style={{ overflowY: 'auto', maxHeight: '90vh' }}
            >
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3 d-none d-md-block"
                aria-label="Close"
                onClick={() => setSelectedProduct(null)}
              />

              <p
                className="text-uppercase small text-primary fw-semibold mb-1"
                style={{ letterSpacing: 1 }}
              >
                {p.category}
              </p>
              <h2 className="h3 fw-bold mb-3 pe-4">{p.name}</h2>

              <div className="d-flex align-items-center gap-2 mb-3">
                <Stars value={p.rating} />
                <span className="small text-secondary">({p.reviews} reviews)</span>
              </div>

              <div className="d-flex align-items-baseline gap-2 mb-3">
                <span className="fs-3 fw-bold text-primary">{formatINR(p.price)}</span>
                <span className="text-secondary text-decoration-line-through">
                  {formatINR(p.oldPrice)}
                </span>
                <span className="badge bg-success bg-opacity-10 text-success">
                  {Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% off
                </span>
              </div>

              <p className="text-secondary mb-4">{p.desc}</p>

              <h4
                className="small fw-semibold text-uppercase text-secondary mb-2"
                style={{ letterSpacing: 0.5 }}
              >
                Key Features
              </h4>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                {p.specs.map((s) => (
                  <li key={s} className="d-flex align-items-center gap-2 small">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(p.id)}
                  className="btn btn-outline-secondary d-grid"
                  style={{ width: 48, height: 48, placeItems: 'center' }}
                  aria-label="Wishlist"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={wishlist.includes(p.id) ? '#ef4444' : 'none'}
                    stroke={wishlist.includes(p.id) ? '#ef4444' : 'currentColor'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(p)
                    setSelectedProduct(null)
                    setCartOpen(true)
                  }}
                  className="btn btn-primary fw-semibold flex-fill"
                >
                  Add to Cart · {formatINR(p.price)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductModal
