import { products } from '../data/Constants'
import { useStore } from '../context/StoreContext'
import { formatINR } from '../utils/Format'
import ProductIllustration from './ProductIllustration'
import Stars from './Stars'

const Hero = () => {
  const { setSelectedProduct, addToCart } = useStore()
  const featured = products[0]

  return (
    <section className="position-relative overflow-hidden">
      <div
        className="position-absolute rounded-circle bg-primary bg-opacity-25"
        style={{ top: -96, left: -96, width: 288, height: 288, filter: 'blur(80px)' }}
      />
      <div
        className="position-absolute rounded-circle"
        style={{
          bottom: -128,
          right: -96,
          width: 320,
          height: 320,
          background: '#c084fc',
          opacity: 0.4,
          filter: 'blur(80px)',
        }}
      />

      <div className="container position-relative py-5">
        <div className="row align-items-center g-5 py-5">
          <div className="col-12 col-lg-6">
            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 fw-semibold">
              <span
                className="d-inline-block bg-primary rounded-circle me-2"
                style={{ width: 6, height: 6, verticalAlign: 'middle' }}
              />
              Winter Sale · Flat 30% Off
            </span>

            <h1 className="display-4 fw-bold mt-4 lh-1">
              Furniture that feels like <span className="text-primary">home</span>
            </h1>

            <p className="lead text-secondary mt-3">
              Handpicked, handcrafted aur hamesha ke liye bana hua. Solid wood, premium fabrics aur
              10 saal ki warranty — sab ek jagah.
            </p>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <a href="#products" className="btn btn-primary btn-lg fw-semibold px-4 shadow">
                Shop Collection
              </a>
              <a
                href="#categories"
                className="btn btn-outline-secondary btn-lg fw-semibold px-4 d-inline-flex align-items-center gap-2"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Browse Categories
              </a>
            </div>

            <div className="d-flex align-items-center gap-3 mt-4">
              <div className="d-flex">
                {['bg-primary', 'bg-purple', 'bg-pink', 'bg-warning'].map((c, i) => (
                  <span
                    key={i}
                    className={`rounded-circle border border-2 border-white ${c}`}
                    style={{ width: 32, height: 32, marginLeft: i === 0 ? 0 : -8 }}
                  />
                ))}
              </div>
              <p className="small text-secondary mb-0">
                <span className="fw-semibold text-dark">50,000+</span> happy homes across India
              </p>
            </div>
          </div>

          <div className="col-12 col-lg-6 position-relative">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="position-relative"
                style={{ background: featured.bg, minHeight: 320 }}
              >
                <span className="position-absolute top-0 end-0 m-3 badge bg-white text-primary fw-semibold shadow-sm px-3 py-2" style={{ zIndex: 1 }}>
                  Featured
                </span>
                {featured.img ? (
                  <img
                    src={featured.img}
                    alt={featured.name}
                    className="d-block w-100"
                    style={{ height: 320, objectFit: 'cover' }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center py-5">
                    <ProductIllustration color={featured.color} size={240} />
                  </div>
                )}
              </div>

              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <p className="small text-secondary mb-1">Featured Product</p>
                    <h3 className="h5 fw-bold mb-0">{featured.name}</h3>
                  </div>
                  <Stars value={featured.rating} />
                </div>
                <div className="d-flex align-items-baseline gap-2 mb-3">
                  <span className="fs-4 fw-bold text-primary">{formatINR(featured.price)}</span>
                  <span className="text-secondary text-decoration-line-through small">
                    {formatINR(featured.oldPrice)}
                  </span>
                  <span className="badge bg-success bg-opacity-10 text-success small">22% OFF</span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(featured)}
                    className="btn btn-outline-primary fw-semibold flex-fill"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => addToCart(featured)}
                    className="btn btn-primary fw-semibold flex-fill"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <div
              className="position-absolute bg-white border rounded-3 px-3 py-2 shadow d-none d-sm-block"
              style={{ bottom: -16, left: -16 }}
            >
              <p className="small text-secondary mb-0">Free Delivery</p>
              <p className="fw-bold text-success mb-0 small">Pan-India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
