import { stats } from '../data/Constants'

const Stats = () => (
  <section className="container py-5">
    <div className="row text-center g-4">
      {stats.map((s) => (
        <div key={s.label} className="col-6 col-lg-3">
          <p className="display-6 fw-bold mb-1">{s.value}</p>
          <p className="small text-secondary mb-0 fw-medium">{s.label}</p>
        </div>
      ))}
    </div>
  </section>
)

export default Stats
