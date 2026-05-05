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
        setItems([
          { productId: 1, quantity: 1, unitPrice: 2999 },
          { productId: 3, quantity: 2, unitPrice: 1499 },
        ]);
      });

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
    try {
      return new Date(str).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });
    } catch { return str; }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${BASE_URL}/orders/cancel?orderId=${id}`, {
        method: "POST", credentials: "include",
      });
      if (res.ok) {
        addToast("Order cancelled successfully", "success");
        navigate("/orders");
      } else {
        addToast("Failed to cancel order", "error");
      }
    } catch {
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
        method: "POST", body: formData, credentials: "include",
      });
      if (res.ok) {
        setDeliveryAddress(editAddressValue);
        setIsEditingAddress(false);
        addToast("Address updated successfully", "success");
      } else {
        addToast("Failed to update address", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="breadcrumb">
        <Link to="/products">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/orders">Orders</Link>
        <span className="breadcrumb-sep">/</span>
        <span>Details</span>
      </div>

      {/* Stats hero */}
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

      {/* Cancel button */}
      {(status === "Placed" || status === "Pending") && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
          <button className="btn btn-danger" onClick={handleCancelOrder}>
            Cancel Order
          </button>
        </div>
      )}

      {/* Items table — responsive (card view on mobile via CSS) */}
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
              const pId    = item.productId || item.product_id;
              const pName  = item.productName || item.product_name || `Product #${pId}`;
              const pImage = item.imageUrl || item.image_url || "https://via.placeholder.com/50";
              const price  = item.unitPrice || item.unit_price || 0;
              const qty    = item.quantity || 1;
              const total  = price * qty;

              return (
                <tr key={i}>
                  <td>
                    <div className="order-item-product">
                      <Link to={`/product/${pId}`}>
                        <img
                          src={pImage}
                          alt={pName}
                          className="order-item-img"
                        />
                      </Link>
                      <div>
                        <div className="order-item-name">{pName}</div>
                        {item.sizeLabel && (
                          <div className="order-item-size">Size: {item.sizeLabel}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td data-label="Price">₹{price.toLocaleString()}</td>
                  <td data-label="Qty">{qty}</td>
                  <td data-label="Total">₹{total.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delivery address */}
      {deliveryAddress && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1.5rem",
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.8rem",
            gap: "1rem",
          }}>
            <h3 style={{ fontSize: "1.1rem", margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
              Delivery Address
            </h3>
            {(status === "Placed" || status === "Pending") && !isEditingAddress && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setIsEditingAddress(true); setEditAddressValue(deliveryAddress); }}
              >
                Edit
              </button>
            )}
          </div>

          {isEditingAddress ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <textarea
                className="form-textarea"
                rows="3"
                value={editAddressValue}
                onChange={e => setEditAddressValue(e.target.value)}
              />
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsEditingAddress(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-rose btn-sm"
                  onClick={handleSaveAddress}
                  disabled={isSavingAddress}
                >
                  {isSavingAddress ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ lineHeight: 1.6, color: "var(--text-2)", whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
              {deliveryAddress}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderDetails;