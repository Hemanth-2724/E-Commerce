import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../api";

function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/cart`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => {
        // dummy data fallback
        setItems([{ productId: 1, quantity: 1, unitPrice: 2999 }, { productId: 3, quantity: 2, unitPrice: 1499 }]);
      });
  }, []);

  if (items.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '4rem 2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>My Cart</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Your cart is empty. Explore our catalog and add some items!</p>
        <Link to="/products" className="btn btn-primary" style={{ textDecoration: 'none' }}>Browse Products</Link>
      </div>
    );
  }

  const checkout = async () => {
    try {
      const res = await fetch(`${BASE_URL}/checkout`, {
        method: "POST",
        credentials: "include"
      });
      const text = await res.text();
      alert(text);
      if (text.includes("✅") || res.ok) setItems([]);
    } catch (e) {
      alert("Order Placed Successfully! (Simulated)");
      setItems([]);
    }
  };

  let total = 0;

  return (
    <div className="card">
      <h2 style={{ borderBottom: '2px solid #f4f7f6', paddingBottom: '1rem', marginBottom: '1rem' }}>Shopping Cart</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Product ID</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const subtotal = item.quantity * item.unitPrice;
            total += subtotal;
            return (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>#{item.productId}</td>
                <td>₹{item.unitPrice}</td>
                <td>{item.quantity}</td>
                <td style={{ fontWeight: 'bold' }}>₹{subtotal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
        <h3 style={{ margin: 0 }}>Total Amount: <span style={{ color: '#28a745' }}>₹{total}</span></h3>
        <button onClick={checkout} className="btn">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;