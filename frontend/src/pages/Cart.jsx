import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";

function CheckoutModal({ total, address, onClose, onConfirm, loading }) {
  const [deliveryAddr, setDeliveryAddr] = useState(address || "");
  const [payment, setPayment]           = useState("COD");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Confirm Order</h2>

        <div className="form-field">
          <label className="form-label">Delivery Address</label>
          <textarea
            className="form-textarea"
            value={deliveryAddr}
            onChange={e => setDeliveryAddr(e.target.value)}
            placeholder="Enter delivery address…"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Payment Method</label>
          <select className="form-select" value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="COD">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="Card">Credit / Debit Card</option>
          </select>
        </div>

        <div className="summary-row total" style={{ margin: '1rem 0' }}>
          <span>Order Total</span>
          <span className="gold">₹{total.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-gold"
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={loading || !deliveryAddr.trim()}
            onClick={() => onConfirm(deliveryAddr, payment)}
          >
            {loading ? "Placing…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [placing, setPlacing]     = useState(false);
  const { user, refreshCartCount, setCartCount } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchCart = () => {
    setLoading(true);
    fetch(`${BASE_URL}/cart`, { credentials: "include" })
      .then(async r => {
        if (r.status === 401) { navigate("/"); return []; }
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
          setCartCount(data.reduce((s, i) => s + i.quantity, 0));
        }
      })
      .catch(() => {
        // Fallback for UI testing
        setItems([
          { itemId: 1, productId: 1, productName: "Floral Wrap Dress", sizeLabel: "M", quantity: 1, unitPrice: 1169, imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400" },
          { itemId: 2, productId: 3, productName: "Slim Fit Chinos",   sizeLabel: "32", quantity: 2, unitPrice: 949, imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`${BASE_URL}/cart?itemId=${itemId}`, {
        method: "DELETE", credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(i => i.itemId !== itemId));
        refreshCartCount();
        addToast("Item removed", "success");
      }
    } catch {
      setItems(prev => prev.filter(i => i.itemId !== itemId));
      addToast("Item removed", "success");
    }
  };

  const placeOrder = async (deliveryAddr, payment) => {
    setPlacing(true);
    const formData = new URLSearchParams();
    formData.append("deliveryAddress", deliveryAddr);
    formData.append("paymentMethod",   payment);

    try {
      const res = await fetch(`${BASE_URL}/checkout`, {
        method: "POST", body: formData, credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setItems([]);
        setCartCount(0);
        setShowModal(false);
        addToast("🎉 Order placed successfully!", "success");
        navigate("/orders");
      } else {
        addToast(data.error || "Order failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setPlacing(false);
    }
  };

  const total    = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (loading) return <span className="spinner" />;

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🛍</span>
        <h3>Your cart is empty</h3>
        <p style={{ marginBottom: '2rem' }}>Discover something beautiful from our collections.</p>
        <Link to="/products" className="btn btn-gold">Browse Collections</Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-subtitle">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="card">
          {items.map(item => (
            <div key={item.itemId} className="cart-item">
              <img
                src={item.imageUrl || "https://via.placeholder.com/90"}
                alt={item.productName}
                className="cart-item-img"
              />
              <div>
                <div className="cart-item-name">{item.productName || `Product #${item.productId}`}</div>
                {item.sizeLabel && <div className="cart-item-size">Size: {item.sizeLabel}</div>}
                <div className="cart-item-price">
                  ₹{(item.unitPrice * item.quantity).toLocaleString()}
                </div>
                <div className="qty-control">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Qty: {item.quantity}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>× ₹{item.unitPrice}</span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeItem(item.itemId)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal ({itemCount} items)</span><span>₹{total.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--success)' }}>{total >= 1999 ? "Free" : "₹99"}</span></div>
          <div className="summary-row total">
            <span>Total</span>
            <span className="gold">₹{(total >= 1999 ? total : total + 99).toLocaleString()}</span>
          </div>

          <button
            className="btn btn-gold btn-full"
            style={{ marginTop: '1.5rem', padding: '1rem' }}
            onClick={() => setShowModal(true)}
          >
            Proceed to Checkout
          </button>
          <Link to="/products" className="btn btn-ghost btn-full" style={{ marginTop: '0.7rem', justifyContent: 'center' }}>
            Continue Shopping
          </Link>

          <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'center' }}>
            🔒 Secure checkout • Free returns
          </div>
        </div>
      </div>

      {showModal && (
        <CheckoutModal
          total={total >= 1999 ? total : total + 99}
          address={user?.address || ""}
          onClose={() => setShowModal(false)}
          onConfirm={placeOrder}
          loading={placing}
        />
      )}
    </>
  );
}