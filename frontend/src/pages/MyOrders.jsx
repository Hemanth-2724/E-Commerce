import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../api";

const STATUS_CLASS = {
  Placed:    "status-placed",
  Shipped:   "status-shipped",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
  Pending:   "status-pending",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/checkout`, { credentials: "include" })
      .then(async r => {
        if (r.status === 401) { navigate("/"); return []; }
        return r.json();
      })
      .then(data => Array.isArray(data) && setOrders(data))
      .catch(() => {
        setOrders([
          { orderId: 101, orderStatus: "Placed",   totalAmount: 5997, orderDate: "2024-05-01 10:30:00", paymentMethod: "COD" },
          { orderId: 102, orderStatus: "Shipped",  totalAmount: 1499, orderDate: "2024-04-28 14:20:00", paymentMethod: "UPI" },
          { orderId: 103, orderStatus: "Delivered",totalAmount: 2398, orderDate: "2024-04-20 09:15:00", paymentMethod: "Card" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (str) => {
    try { return new Date(str).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return str; }
  };

  if (loading) return <span className="spinner" />;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No orders yet</h3>
          <p style={{ marginBottom: '2rem' }}>Start shopping to see your orders here.</p>
          <Link to="/products" className="btn btn-gold">Browse Collections</Link>
        </div>
      ) : (
        orders.map(o => (
          <div key={o.orderId} className="order-card">
            <div>
              <div className="order-id">Order #{o.orderId}</div>
              <div className="order-meta">
                {formatDate(o.orderDate)}
                {o.paymentMethod && ` · ${o.paymentMethod}`}
              </div>
              <div style={{ marginTop: '0.6rem' }}>
                <span className={`status-badge ${STATUS_CLASS[o.orderStatus] || "status-pending"}`}>
                  {o.orderStatus}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '0.8rem' }}>
                ₹{o.totalAmount?.toLocaleString()}
              </div>
              <Link to={`/order/${o.orderId}`} className="btn btn-ghost btn-sm">
                View Details →
              </Link>
            </div>
          </div>
        ))
      )}
    </>
  );
}