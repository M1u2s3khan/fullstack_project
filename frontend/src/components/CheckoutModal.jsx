import { useStore } from '../context/StoreContext'
import { formatINR } from '../utils/Format'

const CheckoutModal = () => {
  const {
    checkoutOpen,
    setCheckoutOpen,
    checkoutStep,
    setCheckoutStep,
    checkoutData,
    setCheckoutData,
    orderPlaced,
    handlePlaceOrder,
    isPlacingOrder,
    orderError,
    cartTotal,
  } = useStore()

  if (!checkoutOpen) return null

  const canContinueStep1 = checkoutData.fullName && checkoutData.phone
  const canContinueStep2 = checkoutData.address && checkoutData.city && checkoutData.pincode

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 1200, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && checkoutStep !== 3) setCheckoutOpen(false)
      }}
    >
      <section
        className="card border-0 shadow-lg rounded-4 w-100 overflow-hidden"
        style={{ maxWidth: 720, maxHeight: '92vh' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between">
          <div>
            <h2 className="h5 fw-bold mb-0">Checkout</h2>
            <p className="small text-secondary mb-0">
              {checkoutStep === 1 && 'Step 1 of 3 · Contact details'}
              {checkoutStep === 2 && 'Step 2 of 3 · Delivery address'}
              {checkoutStep === 3 && 'Order confirmed'}
            </p>
          </div>
          {checkoutStep !== 3 && (
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setCheckoutOpen(false)}
            />
          )}
        </div>

        <div className="px-4 pt-3">
          <div className="d-flex gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex-fill"
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: n <= checkoutStep ? '#4f46e5' : '#e2e8f0',
                }}
              />
            ))}
          </div>
        </div>

        <div className="p-4" style={{ overflowY: 'auto' }}>
          {/* Step 1 */}
          {checkoutStep === 1 && (
            <div>
              <h3 className="h6 fw-bold mb-3">Contact Information</h3>
              <div className="mb-3">
                <label className="form-label small">Full name</label>
                <input
                  className="form-control"
                  value={checkoutData.fullName}
                  onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })}
                  placeholder="Rahul Sharma"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small">Phone number</label>
                <input
                  className="form-control"
                  type="tel"
                  value={checkoutData.phone}
                  onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="alert alert-light border small mb-0">
                <strong>Note:</strong> Order place hone par confirmation yahin dikhega.
              </div>
            </div>
          )}

          {/* Step 2 */}
          {checkoutStep === 2 && (
            <div>
              <h3 className="h6 fw-bold mb-3">Delivery Address</h3>
              <div className="mb-3">
                <label className="form-label small">Address</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={checkoutData.address}
                  onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                  placeholder="Flat no, building, street, area"
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-7">
                  <label className="form-label small">City</label>
                  <input
                    className="form-control"
                    value={checkoutData.city}
                    onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="col-5">
                  <label className="form-label small">Pincode</label>
                  <input
                    className="form-control"
                    value={checkoutData.pincode}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                      })
                    }
                    placeholder="400001"
                  />
                </div>
              </div>

              <h4
                className="small fw-semibold text-uppercase text-secondary mb-2"
                style={{ letterSpacing: 0.5 }}
              >
                Payment Method
              </h4>
              <div className="d-flex flex-column gap-2">
                {[
                  {
                    key: 'cod',
                    label: 'Cash on Delivery',
                    desc: 'Order pahunchne par payment karein.',
                  },
                  {
                    key: 'razorpay',
                    label: 'Pay Online',
                    desc: 'UPI, credit/debit cards, net banking aur wallets via Razorpay.',
                  },
                ].map((option) => (
                  <label
                    key={option.key}
                    className={
                      'border rounded-3 p-3 d-flex align-items-start gap-3 ' +
                      (checkoutData.payment === option.key
                        ? 'border-primary bg-primary bg-opacity-10'
                        : '')
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="form-check-input mt-1"
                      checked={checkoutData.payment === option.key}
                      onChange={() => setCheckoutData({ ...checkoutData, payment: option.key })}
                    />
                    <div>
                      <p className="fw-semibold mb-0 small">{option.label}</p>
                      <p className="small text-secondary mb-0">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {orderError && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  {orderError}
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {checkoutStep === 3 && orderPlaced && (
            <div className="text-center py-4">
              <div
                className="d-grid mx-auto bg-success bg-opacity-10 text-success rounded-circle mb-3"
                style={{ width: 72, height: 72, placeItems: 'center' }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="h4 fw-bold mb-2">Order Confirmed!</h3>
              <p className="text-secondary mb-4">
                Thank you, {checkoutData.fullName}. Aapka order successfully place ho gaya hai.
              </p>

              <div className="bg-light rounded-3 p-3 text-start mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-secondary">Order ID</span>
                  <span className="fw-semibold">{orderPlaced.id}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-secondary">Date</span>
                  <span className="fw-semibold">{orderPlaced.date}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-secondary">Payment</span>
                  <span className="fw-semibold">
                    {orderPlaced.payment === 'razorpay' ? 'Online payment' : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="d-flex justify-content-between small border-top pt-2 mt-2">
                  <span className="fw-semibold">Order Total</span>
                  <span className="fw-bold text-primary">{formatINR(orderPlaced.total)}</span>
                </div>
                <div className="d-flex justify-content-between small mt-1">
                  <span className="text-secondary">Payment status</span>
                  <span className="fw-semibold">
                    {orderPlaced.paymentStatus === 'paid' ? 'Paid' : 'Due on delivery'}
                  </span>
                </div>
              </div>

              <p className="small text-secondary">
                Delivery estimate 5–7 business days hai. Order details save ho chuki hain.
              </p>
            </div>
          )}
        </div>

        {checkoutStep !== 3 && (
          <div className="border-top p-4 d-flex gap-2 bg-light">
            {checkoutStep > 1 && (
              <button
                type="button"
                onClick={() => setCheckoutStep(checkoutStep - 1)}
                className="btn btn-outline-secondary fw-semibold"
              >
                Back
              </button>
            )}
            {checkoutStep === 1 && (
              <button
                type="button"
                disabled={!canContinueStep1}
                onClick={() => setCheckoutStep(2)}
                className="btn btn-primary fw-semibold flex-fill"
              >
                Continue
              </button>
            )}
            {checkoutStep === 2 && (
              <button
                type="button"
                disabled={!canContinueStep2 || isPlacingOrder}
                onClick={handlePlaceOrder}
                className="btn btn-primary fw-semibold flex-fill"
              >
                {isPlacingOrder
                  ? 'Processing...'
                  : `${checkoutData.payment === 'razorpay' ? 'Pay' : 'Place Order'} · ${formatINR(cartTotal)}`}
              </button>
            )}
          </div>
        )}

        {checkoutStep === 3 && (
          <div className="border-top p-4 d-flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCheckoutOpen(false)
                setCheckoutStep(1)
              }}
              className="btn btn-primary fw-semibold w-100"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default CheckoutModal
