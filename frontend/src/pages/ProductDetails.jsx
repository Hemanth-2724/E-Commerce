import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";

const SIZES_BY_CATEGORY = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  pants:    ["28", "30", "32", "34", "36"],
  default:  ["Free Size"],
};

export default function ProductDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { refreshCartCount } = useAuth();
  const { addToast } = useToast();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [size, setSize]         = useState("");
  const [adding, setAdding]     = useState(false);
  const [qty, setQty]           = useState(1);

  useEffect(() => {
    fetch(`${BASE_URL}/products?id=${id}`)
      .then(r => r.json())
      .then(p => { setProduct(p); setLoading(false); })
      .catch(() => {
        setProduct({ productId: id, productName: "Premium Product", price: 2999, discountPercent: 10, description: "An incredible premium product with top-tier craftsmanship and high-quality materials. Designed for the modern individual who appreciates style and comfort.", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600", categoryName: "Women" });
        setLoading(false);
      });
  }, [id]);

  const discounted = (p) => Math.round(p.price * (1 - (p.discountPercent || 0) / 100));

  const addToCart = async () => {
    if (!size) { addToast("Please select a size", "error"); return; }
    setAdding(true);

    const formData = new URLSearchParams();
    formData.append("productId", product.productId);
    formData.append("quantity",  qty);
    formData.append("price",     discounted(product));
    formData.append("sizeLabel", size);

    try {
      const res = await fetch(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        credentials: "include",
      });

      if (res.status === 401) {
        addToast("Session expired. Please log in again.", "error");
        navigate("/");
        return;
      }

      const data = await res.json();
      if (data.success) {
        addToast(`${product.productName} added to cart!`, "success");
        refreshCartCount();
        navigate("/cart");
      } else {
        addToast(data.error || "Failed to add to cart", "error");
      }
    } catch {
      addToast("Network error. Is the server running?", "error");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <span className="spinner" />;
  if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

  const finalPrice    = discounted(product);
  const savings       = product.price - finalPrice;
  const sizes         = product.productName?.toLowerCase().includes("chino") || product.productName?.toLowerCase().includes("jean")
                          ? SIZES_BY_CATEGORY.pants
                          : SIZES_BY_CATEGORY.clothing;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/products">Collections</Link>
        <span className="breadcrumb-sep">›</span>
        {product.categoryName && <><span>{product.categoryName}</span><span className="breadcrumb-sep">›</span></>}
        <span style={{ color: 'var(--text)' }}>{product.productName}</span>
      </div>

      <div className="detail-layout">
        <div>
          <img src={product.imageUrl} alt={product.productName} className="detail-img" />
        </div>

        <div>
          {product.categoryName && <div className="detail-cat">{product.categoryName}</div>}
          <h1 className="detail-name">{product.productName}</h1>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-price-row">
            <span className="detail-price">₹{finalPrice}</span>
            {product.discountPercent > 0 && (
              <>
                <span className="detail-original">₹{product.price}</span>
                <span style={{ background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                  Save ₹{savings}
                </span>
              </>
            )}
          </div>

          <div className="size-label">Select Size</div>
          <div className="sizes">
            {sizes.map(s => (
              <button
                key={s}
                className={`size-btn ${size === s ? "active" : ""}`}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity</span>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-gold"
              style={{ flex: 1, justifyContent: 'center', padding: '1rem' }}
              onClick={addToCart}
              disabled={adding}
            >
              {adding ? "Adding…" : "Add to Cart"}
            </button>
            <Link to="/cart" className="btn btn-ghost" style={{ padding: '1rem 1.5rem' }}>
              View Cart
            </Link>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-3)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-2)' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>🚚 Free shipping over ₹1999</span>
              <span>↩ 30-day returns</span>
              <span>✓ Authentic quality</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}