import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../api";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => {
        // Fallback for UI styling
        setProducts([
            { productId: 1, productName: "Wireless Headphones", price: 2999, description: "High quality sound and deep bass.", imageUrl: "https://via.placeholder.com/300?text=Headphones" },
            { productId: 2, productName: "Smart Watch", price: 4999, description: "Track your fitness and stay connected.", imageUrl: "https://via.placeholder.com/300?text=Smart+Watch" },
            { productId: 3, productName: "Gaming Mouse", price: 1499, description: "Ergonomic design with RGB lighting.", imageUrl: "https://via.placeholder.com/300?text=Mouse" }
        ]);
      });
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Trending Products</h2>
      </div>
      <div className="grid">
        {products.map(p => (
          <div key={p.productId} className="card text-center" style={{ padding: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
            <img src={p.imageUrl} alt={p.productName} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px' }} />
            <h3 style={{ margin: '1.2rem 0 0.5rem 0' }}>{p.productName}</h3>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '1rem', height: '40px' }}>{p.description.substring(0, 60)}...</p>
            <h4 style={{ color: '#28a745', fontSize: '1.4rem', marginBottom: '1rem' }}>₹{p.price}</h4>
            <Link to={`/product/${p.productId}`} className="btn btn-primary" style={{ display: 'block', textDecoration: 'none' }}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;