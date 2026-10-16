const Stars = ({ value, size = 14 }) => (
  <div className="d-flex align-items-center gap-1 small">
    <svg width={size} height={size} fill="#f59e0b" viewBox="0 0 24 24">
      <path d="M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.4l7-.9L12 2z" />
    </svg>
    <span className="fw-semibold">{value}</span>
  </div>
)

export default Stars
