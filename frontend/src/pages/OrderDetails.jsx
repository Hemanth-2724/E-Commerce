import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";

const STATUS_CLASS = {
  Placed:    "status-placed",
  Shipped:   "status-shipped",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
  Pending:   "status-pending",
};

function OrderDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [orderDate, setOrderDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressValue, setEditAddressValue] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/checkout?orderId=${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {
        setItems([{ productId: 1, quantity: 1, unitPrice: 2999 }, { productId: 3, quantity: 2, unitPrice: 1499 }]);
      });

    // Fetch the list of orders to extract the specific order status
    fetch(`${BASE_URL}/checkout`, { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const order = data.find(o => String(o.orderId || o.order_id) === String(id));
          if (order) {
            setStatus(order.orderStatus || order.order_status || "Placed");
            setOrderDate(order.orderDate || order.order_date || "");
            setPaymentMethod(order.paymentMethod || order.payment_method || "N/A");
            setDeliveryAddress(order.deliveryAddress || order.delivery_address || "");
          }
        }
      })
      .catch(() => setStatus("Placed"));
  }, [id]);

  const orderTotal = items.reduce((acc, item) => {
    const price = item.unitPrice || item.unit_price || 0;
    const qty = item.quantity || 1;
    return acc + (price * qty);
  }, 0);

  const formatDate = (str) => {
    if (!str) return "N/A";
    try { return new Date(str).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return str; }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      const res = await fetch(`${BASE_URL}/orders/cancel?orderId=${id}`, { method: "POST", credentials: "include" });
      if (res.ok) {
        addToast("Order cancelled successfully", "success");
        navigate("/orders");
      } else {
        addToast("Failed to cancel order", "error");
      }
    } catch (err) {
      addToast("Network error", "error");
    }
  };

  const handleSaveAddress = async () => {
    if (!editAddressValue.trim()) {
      addToast("Address cannot be empty", "error");
      return;
    }
    setIsSavingAddress(true);
    try {
      const formData = new URLSearchParams();
      formData.append("orderId", id);
      formData.append("deliveryAddress", editAddressValue);

      const res = await fetch(`${BASE_URL}/orders/update-address`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (res.ok) {
        setDeliveryAddress(editAddressValue);
        setIsEditingAddress(false);
        addToast("Address updated successfully", "success");
      } else {
        addToast("Failed to update address", "error");
      }
    } catch (err) {
      addToast("Network error", "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <style>{`
        @media (max-width: 768px) {
          .order-detail-hero { display: flex; flex-direction: column; gap: 1rem; }
          .order-items-table { overflow-x: auto; display: block; white-space: nowrap; border-radius: 8px; }
          .order-items-table table { width: 100%; min-width: 600px; }
        }
      `}</style>
      <div className="breadcrumb">
        <Link to="/products">Home</Link> <span className="breadcrumb-sep">/</span> 
        <Link to="/orders">Orders</Link> <span className="breadcrumb-sep">/</span> 
        <span>Details</span>
      </div>

      <div className="order-detail-hero">
        <div className="order-detail-stat">
          <div className="order-detail-stat-label">Date</div>
          <div className="order-detail-stat-val">{formatDate(orderDate)}</div>
        </div>
        <div className="order-detail-stat">
          <div className="order-detail-stat-label">Payment</div>
          <div className="order-detail-stat-val">{paymentMethod}</div>
        </div>
        <div className="order-detail-stat">
          <div className="order-detail-stat-label">Total</div>
          <div className="order-detail-stat-val">₹{orderTotal.toLocaleString()}</div>
        </div>
        <div className="order-detail-stat">
          <div className="order-detail-stat-label">Status</div>
          <span className={`status-badge ${STATUS_CLASS[status] || "status-pending"}`}>
            {status}
          </span>
        </div>
      </div>

      {(status === "Placed" || status === "Pending") && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button className="btn btn-danger" onClick={handleCancelOrder}>
            Cancel Order
          </button>
        </div>
      )}

      <div className="order-items-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const pId = item.productId || item.product_id;
              const pName = item.productName || item.product_name || `Product #${pId}`;
              const pImage = item.imageUrl || item.image_url || "https://via.placeholder.com/50";
              const price = item.unitPrice || item.unit_price || 0;
              const qty = item.quantity || 1;
              const total = price * qty;

              return (
                <tr key={i}>
                  <td>
                    <div className="order-item-product" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Link to={`/product/${pId}`}>
                        <img src={pImage} alt={pName} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      </Link>
                      <div className="order-item-name">{pName}</div>
                    </div>
                  </td>
                  <td>₹{price.toLocaleString()}</td>
                  <td>{qty}</td>
                  <td>₹{total.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deliveryAddress && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Delivery Address</h3>
            {(status === "Placed" || status === "Pending") && !isEditingAddress && (
              <button 
                className="btn btn-sm" 
                style={{ background: 'transparent', border: '1px solid var(--text-3)', color: 'var(--text-2)' }}
                onClick={() => { setIsEditingAddress(true); setEditAddressValue(deliveryAddress); }}
              >
                Edit
              </button>
            )}
          </div>
          
          {isEditingAddress ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea className="form-textarea" rows="3" value={editAddressValue} onChange={(e) => setEditAddressValue(e.target.value)} />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-sm" style={{ background: 'var(--bg-3)', color: 'var(--text-1)' }} onClick={() => setIsEditingAddress(false)}>Cancel</button>
                <button className="btn btn-sm btn-rose" onClick={handleSaveAddress} disabled={isSavingAddress}>{isSavingAddress ? "Saving..." : "Save"}</button>
              </div>
            </div>
          ) : (
            <p style={{ lineHeight: '1.5', color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}>{deliveryAddress}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderDetails;