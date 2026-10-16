import { useStore } from '../context/StoreContext'

const CTA = () => {
  const { openAuth } = useStore()

  return (
    <section className="container pb-5">
      <div
        className="position-relative overflow-hidden text-center text-white rounded-4 p-5 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
      >
        <div
          className="position-absolute rounded-circle bg-white bg-opacity-10"
          style={{ top: -64, right: -64, width: 224, height: 224, filter: 'blur(40px)' }}
        />
        <div
          className="position-absolute rounded-circle bg-white bg-opacity-10"
          style={{ bottom: -80, left: -40, width: 224, height: 224, filter: 'blur(40px)' }}
        />

        <h2 className="fw-bold position-relative display-6">Get ₹2,000 off your first order</h2>
        <p className="position-relative mx-auto mt-3" style={{ maxWidth: 540, opacity: 0.9 }}>
          Sign up karo aur instant discount pao. Free delivery + 10 saal warranty har order par.
        </p>

        <div className="position-relative d-flex flex-wrap justify-content-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => openAuth('signup')}
            className="btn btn-light btn-lg fw-semibold text-primary px-4"
          >
            Claim Discount
          </button>
          <a href="#contact" className="btn btn-outline-light btn-lg fw-semibold px-4">
            Visit Showroom
          </a>
        </div>
      </div>
    </section>
  )
}

export default CTA
