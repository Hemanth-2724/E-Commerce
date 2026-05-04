import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../api";

function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/checkout`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => {
        // Fallback for UI visualization
        setOrders([
          { orderId: 101, orderStatus: "Placed", totalAmount: 5997 },
          { orderId: 102, orderStatus: "Shipped", totalAmount: 1499 }
        ]);
      });
  }, []);

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f4f7f6' }}>Order History</h2>

      {orders.length === 0 ? <p style={{ color: '#666' }}>You have not placed any orders yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Order ID</th>
              <th>Status</th>
              <th>Total Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.orderId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>#{o.orderId}</td>
                <td><span style={{ background: '#e2e3e5', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>{o.orderStatus}</span></td>
                <td style={{ fontWeight: 'bold', color: '#28a745' }}>₹{o.totalAmount}</td>
                <td><Link to={`/order/${o.orderId}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none', fontSize: '0.9rem' }}>View Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyOrders;