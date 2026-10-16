import { categories } from '../data/Constants'

const Categories = () => (
  <section id="categories" className="container py-5">
    <div className="text-center mx-auto" style={{ maxWidth: 640 }}>
      <p
        className="text-uppercase text-primary fw-semibold small mb-1"
        style={{ letterSpacing: 1 }}
      >
        Shop by Room
      </p>
      <h2 className="fw-bold display-6">Har room ke liye perfect furniture</h2>
      <p className="text-secondary mt-3">
        Sofa se lekar study desk tak — har corner ke liye curated collections.
      </p>
    </div>

    <div className="row g-4 mt-4">
      {categories.map((c) => (
        <div key={c.name} className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 border rounded-4 p-3 shadow-sm feature-card">
            <div
              className="d-grid bg-primary bg-opacity-10 text-primary rounded-3 mb-3"
              style={{ width: 44, height: 44, placeItems: 'center' }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {c.icon}
              </svg>
            </div>
            <h3 className="fs-5 fw-semibold">{c.name}</h3>
            <p className="small text-secondary mb-2">{c.desc}</p>
            <p className="small text-primary fw-semibold mb-0">{c.count} →</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

export default Categories
