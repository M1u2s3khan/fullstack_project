const ProductIllustration = ({ color, size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect x="14" y="34" width="72" height="30" rx="8" fill={color} opacity="0.7" />
    <rect x="10" y="56" width="80" height="20" rx="6" fill={color} opacity="0.9" />
    <rect x="20" y="76" width="6" height="12" rx="2" fill={color} />
    <rect x="74" y="76" width="6" height="12" rx="2" fill={color} />
  </svg>
)

export default ProductIllustration
