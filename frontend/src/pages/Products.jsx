import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../api";

const CATEGORIES = ["All", "Women", "Men", "Kids", "Accessories"];

export default function Products() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");

  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(() => {
        // UI fallback
        setProducts([
          { productId: 1, productName: "Floral Wrap Dress",   price: 1299, discountPercent: 10, description: "Elegant summer wrap dress with floral pattern.", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", categoryName: "Women" },
          { productId: 2, productName: "Casual Denim Jacket", price: 1899, discountPercent: 15, description: "Classic blue denim jacket for everyday wear.",    imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400", categoryName: "Women" },
          { productId: 3, productName: "Slim Fit Chinos",     price: 999,  discountPercent: 5,  description: "Modern slim fit chino pants in neutral tones.", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", categoryName: "Men"   },
          { productId: 4, productName: "Oxford Button Shirt", price: 1199, discountPercent: 0,  description: "Classic oxford cotton shirt for refined look.",  imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", categoryName: "Men"   },
          { productId: 5, productName: "Maxi Boho Skirt",     price: 799,  discountPercent: 20, description: "Bohemian style maxi skirt with vibrant prints.", imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5218afa9a7?w=400", categoryName: "Women" },
          { productId: 6, productName: "Kids Printed Tee",    price: 399,  discountPercent: 0,  description: "Colorful printed t-shirt in soft cotton.",       imageUrl: "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=400", categoryName: "Kids"  },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const discounted = (p) => Math.round(p.price * (1 - (p.discountPercent || 0) / 100));

  const filtered = products.filter(p => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase()) ||
                        p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || (p.categoryName || "").includes(category);
    return matchSearch && matchCat;
  });

  if (loading) return <span className="spinner" />;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Collections</h1>
        <p className="page-subtitle">Curated styles for every occasion</p>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search styles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No results found</h3>
          <p>Try a different search or category filter.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map(p => (
            <Link to={`/product/${p.productId}`} key={p.productId} className="product-card">
              <div className="product-card-img-wrap">
                <img src={p.imageUrl} alt={p.productName} className="product-card-img" />
                {p.discountPercent > 0 && (
                  <span className="product-badge">-{p.discountPercent}%</span>
                )}
              </div>
              <div className="product-card-body">
                {p.categoryName && <div className="product-card-cat">{p.categoryName}</div>}
                <h3 className="product-card-name">{p.productName}</h3>
                <p className="product-card-desc">{p.description?.substring(0, 65)}…</p>
                <div className="product-card-footer">
                  <div>
                    <span className="product-price">₹{discounted(p)}</span>
                    {p.discountPercent > 0 && (
                      <span className="product-original-price">₹{p.price}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}