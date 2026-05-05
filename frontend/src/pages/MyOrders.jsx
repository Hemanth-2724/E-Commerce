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
  const [activeTab, setActiveTab] = useState("Active");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/checkout`, { credentials: "include" })
      .then(async r => {
        if (r.status === 401) { navigate("/"); return []; }
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
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

  const filteredOrders = orders.filter(o => {
    const status = o.orderStatus || o.order_status;
    return activeTab === "Active" ? status !== "Cancelled" : status === "Cancelled";
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="page-wrapper fade-in">
      <style>{`
        @media (max-width: 768px) {
          .order-card { flex-direction: column; gap: 1.5rem; align-items: flex-start; }
          .order-card > div:last-child { text-align: left; width: 100%; display: flex; justify-content: space-between; align-items: center; }
          .order-card > div:last-child > div { margin-bottom: 0; }
          .filter-bar { flex-wrap: wrap; }
        }
      `}</style>
      <div className="breadcrumb">
        <Link to="/products">Home</Link> <span className="breadcrumb-sep">/</span> <span>Orders</span>
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} {activeTab === "Active" ? "placed" : "cancelled"}</p>
      </div>

      <div className="filter-bar" style={{ marginBottom: '2rem' }}>
        <button className={`filter-pill ${activeTab === "Active" ? "active" : ""}`} onClick={() => handleTabChange("Active")}>Active Orders</button>
        <button className={`filter-pill ${activeTab === "History" ? "active" : ""}`} onClick={() => handleTabChange("History")}>Cancelled Orders</button>
      </div>

      {currentOrders.length === 0 ? (
        <div key={`empty-${activeTab}`} className="empty-state" style={{ animation: "fadeIn 0.4s ease-out" }}>
          <span className="empty-icon" style={{ display: 'inline-block', animation: 'fadeIn 1s ease-out' }}>📦</span>
          <h3>No {activeTab.toLowerCase()} orders yet</h3>
          <p style={{ marginBottom: '2rem' }}>{activeTab === "Active" ? "Start shopping to see your orders here." : "You have no cancelled orders."}</p>
          <Link to="/products" className="btn btn-rose">Browse Collections</Link>
        </div>
      ) : (
        <div key={`list-${activeTab}-${currentPage}`} style={{ animation: "fadeIn 0.4s ease-out" }}>
        {currentOrders.map(o => {
          const id = o.orderId || o.order_id;
          const date = o.orderDate || o.order_date;
          const method = o.paymentMethod || o.payment_method;
          const status = o.orderStatus || o.order_status || "Pending";
          const total = o.totalAmount || o.total_amount || 0;

          return (
            <div key={id} className="order-card" style={{ animation: "fadeIn 0.6s ease-out" }}>
              <div>
                <div className="order-id" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '1.1rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {formatDate(date)}
                </div>
                <div className="order-meta">
                  {method && `Payment method: ${method}`}
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <span className={`status-badge ${STATUS_CLASS[status] || "status-pending"}`}>
                    {status}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--rose)', marginBottom: '0.8rem' }}>
                  ₹{Number(total).toLocaleString()}
                </div>
                <Link to={`/order/${id}`} className="btn btn-ghost btn-sm">
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`btn btn-sm ${currentPage === num ? 'btn-rose' : 'btn-ghost'}`}
                style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {num}
              </button>
            ))}
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
        </div>
      )}
    </div>
  );
}