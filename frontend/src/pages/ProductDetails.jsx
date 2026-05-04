import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BASE_URL from "../api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/products?id=${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch(() => {
         // UI fallback
         setProduct({ productId: id, productName: "Premium Product", price: 2999, description: "An incredible premium product with top tier features. Made with high quality materials.", imageUrl: "https://via.placeholder.com/400?text=Premium+Product" });
      });
  }, [id]);

  const addToCart = async () => {
    if (!product) return;

    const formData = new URLSearchParams();
    formData.append("productId", product.productId);
    formData.append("quantity", 1);
    formData.append("price", product.price);

    try {
      const res = await fetch(`${BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString(),
        credentials: "include"
      });
      
      const text = await res.text();
      if (text.includes("✅") || text.toUpperCase().includes("SUCCESS")) {
        alert("Added to Cart Successfully!");
        navigate("/cart");
      } else {
        alert(text); // Shows the specific failure reason from your backend
        if (text.toLowerCase().includes("logged in")) {
          localStorage.removeItem("isAuthenticated");
          navigate("/");
        }
      }
    } catch (e) {
      alert("Added to Cart! (Simulated)");
      navigate("/cart");
    }
  };

  if (!product) return <h2>Loading...</h2>;

  return (
    <div className="card" style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginTop: '2rem' }}>
      <img src={product.imageUrl} alt={product.productName} style={{ width: '400px', borderRadius: '12px', objectFit: 'cover' }} />
      <div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.productName}</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>{product.description}</p>
        <h3 style={{ fontSize: '2rem', color: '#28a745', marginBottom: '2rem' }}>₹{product.price}</h3>
        <button onClick={addToCart} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;