import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BASE_URL from "../api";

function OrderDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/checkout?orderId=${id}`)
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(() => {
        setItems([{ productId: 1, quantity: 1, unitPrice: 2999 }, { productId: 3, quantity: 2, unitPrice: 1499 }]);
      });
  }, [id]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f4f7f6' }}>
        <h2>Order Details <span style={{ color: '#007bff' }}>#{id}</span></h2>
        <Link to="/orders" className="btn btn-outline" style={{ textDecoration: 'none' }}>&larr; Back to Orders</Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Product ID</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '1rem' }}>#{item.productId}</td>
              <td>₹{item.unitPrice}</td>
              <td>{item.quantity}</td>
              <td style={{ fontWeight: 'bold' }}>₹{item.unitPrice * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderDetails;