import { products, categoriesList } from '../data/Constants'
import { useStore } from '../context/StoreContext'
import { formatINR } from '../utils/Format'
import ProductIllustration from './ProductIllustration'
import Stars from './Stars'

const Products = () => {
  const {
    activeCategory,
    setActiveCategory,
    wishlist,
    toggleWishlist,
    addToCart,
    setSelectedProduct,
  } = useStore()

  const filteredProducts =
    activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory)

  return (
    <section id="products" className="bg-white border-top border-bottom py-5">
      <div className="container">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <div>
            <p
              className="text-uppercase text-primary fw-semibold small mb-1"
              style={{ letterSpacing: 1 }}
            >
              Bestsellers
            </p>
            <h2 className="fw-bold display-6 mb-0">Trending Furniture</h2>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={
                  'btn btn-sm fw-semibold ' +
                  (activeCategory === cat ? 'btn-primary' : 'btn-outline-secondary')
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="row g-4">
          {filteredProducts.map((p) => {
            const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
            const inWishlist = wishlist.includes(p.id)

            return (
              <div key={p.id} className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border rounded-4 overflow-hidden shadow-sm feature-card">
                  <div
                    className="position-relative"
                    style={{ background: p.bg, height: 200, cursor: 'pointer' }}
                    onClick={() => setSelectedProduct(p)}
                  >
                    {p.badge && (
                      <span className="position-absolute top-0 start-0 m-2 badge bg-dark text-white fw-semibold" style={{ zIndex: 1 }}>
                        {p.badge}
                      </span>
                    )}
                    {p.img && (
                      <img
                        src={p.img}
                        alt={p.name}
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(p.id)
                      }}
                      className="position-absolute top-0 end-0 m-2 btn btn-light btn-sm rounded-circle d-grid"
                      style={{ width: 34, height: 34, placeItems: 'center' }}
                      aria-label="Wishlist"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={inWishlist ? p.color : 'none'}
                        stroke={inWishlist ? p.color : 'currentColor'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
                      </svg>
                    </button>

                    {!p.img && (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <ProductIllustration color={p.color} size={100} />
                      </div>
                    )}

                    <div className="position-absolute bottom-0 start-0 end-0 p-2 d-flex justify-content-center">
                      <span className="badge bg-white text-dark shadow-sm small">
                        Click to view details
                      </span>
                    </div>
                  </div>

                  <div className="card-body p-3 d-flex flex-column">
                    <p
                      className="text-uppercase small text-secondary mb-1"
                      style={{ letterSpacing: 0.5, fontSize: 10 }}
                    >
                      {p.category}
                    </p>
                    <h3 className="h6 fw-semibold mb-2" style={{ minHeight: 44 }}>
                      {p.name}
                    </h3>

                    <div className="d-flex align-items-center gap-2 small mb-2">
                      <Stars value={p.rating} />
                      <span className="text-secondary">({p.reviews})</span>
                    </div>

                    <div className="d-flex align-items-baseline gap-2 mb-3">
                      <span className="fw-bold text-dark">{formatINR(p.price)}</span>
                      <span className="text-secondary text-decoration-line-through small">
                        {formatINR(p.oldPrice)}
                      </span>
                      <span
                        className="badge bg-success bg-opacity-10 text-success"
                        style={{ fontSize: 10 }}
                      >
                        {discount}% off
                      </span>
                    </div>

                    <div className="d-flex gap-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        className="btn btn-outline-secondary btn-sm fw-semibold flex-fill"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        className="btn btn-primary btn-sm fw-semibold flex-fill"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Products
