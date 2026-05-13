import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";
import Navbar from "../component/Navbar";

const SIZES_BY_CATEGORY = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  pants:    ["28", "30", "32", "34", "36"],
  default:  ["Free Size"],
};

export default function ProductDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user, refreshCartCount } = useAuth();
  const { addToast } = useToast();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [size, setSize]         = useState("");
  const [adding, setAdding]     = useState(false);
  const [qty, setQty]           = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/products?id=${id}`)
      .then(r => r.json())
      .then(data => {
        const p = Array.isArray(data) ? data[0] : data;
        setProduct(p);
        setLoading(false);
      })
      .catch(() => {
        setProduct({ productId: id, productName: "Premium Product", price: 2999, discountPercent: 10, description: "An incredible premium product with top-tier craftsmanship and high-quality materials. Designed for the modern individual who appreciates style and comfort.", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600", categoryName: "Women" });
        setLoading(false);
      });
  }, [id]);

  const discounted = (p) => Math.round((p.price || 0) * (1 - (p.discountPercent || p.discount_percent || 0) / 100));

  const addToCart = async () => {
    if (!user) {
      addToast("Please sign in to add items to your cart", "error");
      navigate("/");
      return;
    }
    if (!size) { addToast("Please select a size", "error"); return; }
    setAdding(true);

    const formData = new URLSearchParams();
    formData.append("productId", product.productId || product.product_id);
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

  const pName = product.productName || product.product_name || "Product";
  const pImage = product.imageUrl || product.image_url;
  const pCat = product.categoryName || product.category_name;
  const pPrice = product.price || 0;

  const finalPrice    = discounted(product) || 0;
  const savings       = pPrice - finalPrice;
  const sizes         = pName.toLowerCase().includes("chino") || pName.toLowerCase().includes("jean")
                          ? SIZES_BY_CATEGORY.pants
                          : SIZES_BY_CATEGORY.clothing;
  
  // Mock a gallery by providing a few additional images if none exist
  const images = [
    pImage,
    product.image2Url || pImage,
    product.image3Url || pImage,
  ];

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth || 1;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper page-enter">
      <style>{`
        @keyframes zoomIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .gallery-container {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          gap: 1rem;
        }
        .gallery-container::-webkit-scrollbar {
          display: none;
        }
        .gallery-item {
          flex: 0 0 100%;
          scroll-snap-align: start;
        }
        .detail-img { width: 100%; height: auto; border-radius: 12px; object-fit: cover; }
        .gallery-indicator { display: none; justify-content: center; gap: 0.5rem; margin-top: 1rem; }
        .gallery-indicator .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-3); transition: background 0.3s; }
        .gallery-indicator .dot.active { background: var(--rose); }
        @media (max-width: 768px) {
          .detail-layout { display: flex; flex-direction: column; gap: 2rem; }
          .detail-img { max-height: 500px; }
          .gallery-indicator { display: flex; }
        }
      `}</style>
      <div className="breadcrumb">
        <Link to="/products">Collections</Link>
        <span className="breadcrumb-sep">›</span>
        {pCat && <><span>{pCat}</span><span className="breadcrumb-sep">›</span></>}
        <span style={{ color: 'var(--text)' }}>{pName}</span>
      </div>

      <div className="detail-layout">
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="gallery-container" onScroll={handleScroll}>
            {images.map((src, i) => (
              <div key={i} className="gallery-item">
                <img src={src} alt={`${pName} - ${i + 1}`} className="detail-img" style={{ cursor: 'zoom-in' }} onClick={() => setZoomedImage(src)} />
              </div>
            ))}
          </div>
          <div className="gallery-indicator">
            {images.map((_, i) => <div key={i} className={`dot ${i === activeImageIndex ? 'active' : ''}`} />)}
          </div>
        </div>

        <div>
          {pCat && <div className="detail-cat">{pCat}</div>}
          <h1 className="detail-name">{pName}</h1>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-price-row">
            <span className="detail-price">₹{finalPrice}</span>
            {savings > 0 && (
              <>
                <span className="detail-original">₹{pPrice}</span>
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
      </div>

      {zoomedImage && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out', animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setZoomedImage(null)}
        >
          <button 
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#fff', fontSize: '2.5rem', cursor: 'pointer', zIndex: 10000, lineHeight: 1 }}
            onClick={() => setZoomedImage(null)}
          >
            ×
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed Product" 
            style={{ maxWidth: '95%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', animation: 'zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}