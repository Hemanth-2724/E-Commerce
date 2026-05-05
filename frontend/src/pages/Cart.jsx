import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";

export default function Cart() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing]     = useState(false);
  const [defaultAddress, setDefaultAddress] = useState("");
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [address, setAddress]     = useState("");
  const [payment, setPayment]     = useState("COD");
  const [paymentMethods, setPaymentMethods] = useState([
    { value: "COD", label: "Cash on Delivery (COD)" },
    { value: "Card", label: "Credit / Debit Card" },
    { value: "UPI", label: "UPI" }
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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
          setCartCount(data.reduce((s, i) => s + (i.quantity || 1), 0));
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

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/profile`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.address) {
          setDefaultAddress(data.address);
        } else {
          setUseDefaultAddress(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(`${BASE_URL}/payment-methods`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPaymentMethods(data);
          // Set default payment method to the first one available
          setPayment(data[0].value || data[0].id || "COD");
        }
      }
    } catch (err) {
      console.error("Failed to fetch payment methods", err);
    }
  };

  useEffect(() => { fetchCart(); fetchProfile(); fetchPaymentMethods(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const submitOrder = async (finalAddress) => {
    setPlacing(true);
    const formData = new URLSearchParams();
    formData.append("deliveryAddress", finalAddress);
    formData.append("paymentMethod", payment);

    try {
      const res = await fetch(`${BASE_URL}/checkout`, {
        method: "POST", body: formData, credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setItems([]);
        setCartCount(0);
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

  const handleConfirmOrder = () => {
    const finalAddress = useDefaultAddress ? defaultAddress : address;
    if (!finalAddress || !finalAddress.trim()) {
      addToast("Please enter a delivery address.", "error");
      return;
    }

    if (payment !== "COD") {
      setShowPaymentModal(true);
      return;
    }

    submitOrder(finalAddress);
  };

  const handleDummyPayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setShowPaymentModal(false);
      const finalAddress = useDefaultAddress ? defaultAddress : address;
      submitOrder(finalAddress);
    }, 1500); // simulate 1.5s network delay
  };

  const total    = items.reduce((s, i) => {
    const price = i.unitPrice || i.unit_price || 0;
    const qty = i.quantity || 1;
    return s + (qty * price);
  }, 0);
  const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
  const finalTotal = total >= 1999 ? total : total + 99;

  const isPaymentDisabled = () => {
    if (paymentProcessing) return true;
    if (payment === "Card") {
      const cardDigits = cardNumber.replace(/\D/g, "").length;
      const expiryDigits = expiryDate.replace(/\D/g, "").length;
      return cardDigits !== 16 || expiryDigits !== 4 || cvv.trim().length < 3;
    }
    if (payment === "UPI") {
      return !upiId.trim();
    }
    return false;
  };

  const getPaymentIcon = (val) => {
    if (val === "Card") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
    if (val === "UPI") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
    if (val === "COD") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
    return null;
  };

  if (loading) return <span className="spinner" />;

  if (items.length === 0) {
    return (
      <div className="page-wrapper empty-state">
        <span className="empty-icon" style={{ display: 'inline-flex', marginBottom: '1rem', color: 'var(--text-3)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </span>
        <h3>Your cart is empty</h3>
        <p style={{ marginBottom: '2rem' }}>Discover something beautiful from our collections.</p>
        <Link to="/products" className="btn btn-rose">Browse Collections</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in">
      <style>{`
        @keyframes dropdownScale {
          0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 768px) {
          .cart-layout { display: flex; flex-direction: column; gap: 2rem; }
          .cart-item { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 1.5rem 1rem; }
          .cart-item-img { width: 100%; max-width: 140px; height: auto; border-radius: 8px; }
          .cart-item > div:nth-child(2) { width: 100%; }
          .cart-item > div:last-child { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
          .cart-item-price { margin-bottom: 0; }
        }
      `}</style>
      <div className="breadcrumb">
        <Link to="/products">Home</Link> <span className="breadcrumb-sep">/</span> <span>Cart</span>
      </div>
      <h1 className="page-title">Your Cart</h1>
      <p className="page-subtitle">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items-section">
          {items.map(item => {
            const itemId = item.itemId || item.cart_item_id || item.cartItemId;
            const pId = item.productId || item.product_id;
            const name = item.productName || item.product_name || `Product #${pId}`;
            const image = item.imageUrl || item.image_url || "https://via.placeholder.com/90";
            const price = item.unitPrice || item.unit_price || 0;
            const qty = item.quantity || 1;
            const size = item.sizeLabel || item.size_label;

            return (
            <div key={itemId} className="cart-item">
              <img
                src={image}
                alt={name}
                className="cart-item-img"
              />
              <div>
                <div className="cart-item-name">{name}</div>
                {size && <div className="cart-item-size">Size: {size}</div>}
                <div className="qty-control">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Qty: {qty}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>× ₹{price}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cart-item-price">
                  ₹{(price * qty).toLocaleString()}
                </div>
                <button className="btn btn-danger btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => removeItem(itemId)}>
                  Remove
                </button>
              </div>
            </div>
          )})}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal ({itemCount} items)</span><span>₹{total.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--success)' }}>{total >= 1999 ? "Free" : "₹99"}</span></div>
          
          <div className="form-field" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Delivery Address</label>
            {defaultAddress && (
              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="addressChoice"
                    checked={useDefaultAddress} 
                    onChange={() => setUseDefaultAddress(true)} 
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span style={{ lineHeight: '1.4' }}>Use default address: <br/><span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{defaultAddress}</span></span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="addressChoice"
                    checked={!useDefaultAddress} 
                    onChange={() => setUseDefaultAddress(false)} 
                  />
                  <span>Deliver to a different address</span>
                </label>
              </div>
            )}
            {(!defaultAddress || !useDefaultAddress) && (
              <textarea 
                className="form-textarea" 
                placeholder="Enter your full delivery address..." 
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ marginTop: '0.5rem', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-1)', color: 'var(--text-1)', fontSize: '0.95rem', width: '100%', outline: 'none', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', resize: 'vertical' }}
              ></textarea>
            )}
          </div>
          
          <div className="form-field" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 50 }}>
            <label className="form-label">Payment Method</label>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ marginTop: '0.5rem', padding: '1rem 1.2rem', borderRadius: '10px', border: isDropdownOpen ? '2px solid var(--rose)' : '2px solid var(--border)', backgroundColor: 'var(--bg-1)', color: 'var(--text-1)', fontSize: '1rem', cursor: 'pointer', width: '100%', outline: 'none', transition: 'all 0.2s ease', boxShadow: isDropdownOpen ? '0 4px 12px rgba(225, 29, 72, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 500 }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--rose)' }}>{getPaymentIcon(payment)}</span>
                <span style={{ flex: 1 }}>{paymentMethods.find(pm => (pm.value || pm.id || pm) === payment)?.label || paymentMethods.find(pm => (pm.value || pm.id || pm) === payment)?.name || payment}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-3)' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              
              {isDropdownOpen && (
                <ul style={{ 
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.8rem', padding: '0.5rem', backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.2)', listStyle: 'none', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.3rem', animation: 'dropdownScale 0.2s ease-out forwards', transformOrigin: 'top center'
                }}>
                  {paymentMethods.map((pm, idx) => {
                    const value = pm.value || pm.id || pm;
                    const label = pm.label || pm.name || pm;
                    const isSelected = value === payment;
                    
                    return (
                      <li 
                        key={idx} 
                        onClick={() => { setPayment(value); setIsDropdownOpen(false); }}
                        style={{ padding: '0.8rem 1rem', cursor: 'pointer', color: isSelected ? 'var(--rose)' : 'var(--text-1)', backgroundColor: isSelected ? 'var(--bg-3)' : 'transparent', fontSize: '0.95rem', fontWeight: isSelected ? '600' : '500', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '8px', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-3)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', color: isSelected ? 'var(--rose)' : 'var(--text-2)' }}>{getPaymentIcon(value)}</span>
                        <span>{label}</span>
                        {isSelected && <span style={{ marginLeft: 'auto', color: 'var(--rose)', fontSize: '1.2rem' }}>✓</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          
          <div className="summary-row total">
            <span>Total</span>
            <span className="rose">₹{finalTotal.toLocaleString()}</span>
          </div>

          <button
            className="btn btn-rose btn-full"
            style={{ marginTop: '1.5rem' }}
            disabled={placing}
            onClick={handleConfirmOrder}
          >
            {placing ? "Processing..." : payment === "COD" ? "Confirm Order" : "Proceed to Payment"}
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'var(--bg-1)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Secure Payment Gateway</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
              You selected <strong>{paymentMethods.find(p => (p.value || p.id || p) === payment)?.label || paymentMethods.find(p => (p.value || p.id || p) === payment)?.name || payment}</strong>. Please pay <strong className="rose" style={{ fontSize: '1.1rem' }}>₹{finalTotal.toLocaleString()}</strong> to complete your order.
            </p>
            
            {payment === "Card" && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <div className="form-field">
                  <label className="form-label">Card Number</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="0000 0000 0000 0000" 
                    maxLength="19" 
                    value={cardNumber} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
                      setCardNumber(formatted);
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
                  <div className="form-field" style={{ flex: 1 }}>
                    <label className="form-label">Expiry Date</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      placeholder="MM/YY" 
                      maxLength="5" 
                      value={expiryDate} 
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length >= 3) {
                          val = val.substring(0, 2) + "/" + val.substring(2, 4);
                        }
                        setExpiryDate(val);
                      }} 
                    />
                  </div>
                  <div className="form-field" style={{ flex: 1 }}>
                    <label className="form-label">CVV</label>
                    <input 
                      className="form-input" 
                      type="password" 
                      placeholder="123" 
                      maxLength="4" 
                      value={cvv} 
                      onChange={(e) => setCvv(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {payment === "UPI" && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <div className="form-field">
                  <label className="form-label">UPI ID</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="username@bank" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                  />
                </div>
              </div>
            )}

            <button 
              className="btn btn-rose btn-full" 
              onClick={handleDummyPayment}
              disabled={isPaymentDisabled()}
            >
              {paymentProcessing ? "Processing Payment..." : `Pay ₹${finalTotal.toLocaleString()}`}
            </button>
            {!paymentProcessing && (
              <button 
                className="btn btn-ghost btn-full" 
                style={{ marginTop: '0.8rem' }}
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}