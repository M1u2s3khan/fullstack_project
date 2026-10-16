import { footerCols } from '../data/Constants'

const Footer = () => (
  <footer id="contact" className="bg-white border-top">
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="d-flex align-items-center gap-2 fw-bold text-dark fs-5">
            <span
              className="d-grid bg-primary text-white rounded-3"
              style={{ width: 32, height: 32, placeItems: 'center' }}
            >
              <svg
                width="18"
                height="18"
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
          </div>
          <p className="small text-secondary mt-3 mb-0" style={{ maxWidth: 260 }}>
            Handcrafted furniture for modern Indian homes. Made with care, built to last.
          </p>
        </div>

        {footerCols.map((col) => (
          <div key={col.title} className="col-6 col-lg-3">
            <h4 className="small fw-semibold mb-3">{col.title}</h4>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {col.links.map((l) => (
                <li key={l}>
                  <span className="small text-secondary">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 border-top mt-5 pt-4">
        <p className="small text-secondary mb-0">
          © {new Date().getFullYear()} HomeCraft. All rights reserved.
        </p>
        <div className="d-flex gap-3">
          {['Instagram', 'Facebook', 'Pinterest'].map((s) => (
            <span key={s} className="small text-secondary">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
