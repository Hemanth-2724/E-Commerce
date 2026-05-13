import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BASE_URL from "../api";
import Navbar from "../component/Navbar";

/* ── constants ────────────────────────────────────────── */
const GENDER_TABS = ["All", "Women", "Men", "Kids", "Accessories"];

const PRICE_RANGES = [
  { label: "Under ₹500",        min: 0,    max: 500  },
  { label: "₹500 – ₹1,000",    min: 500,  max: 1000 },
  { label: "₹1,000 – ₹2,000",  min: 1000, max: 2000 },
  { label: "₹2,000 – ₹5,000",  min: 2000, max: 5000 },
  { label: "Above ₹5,000",      min: 5000, max: Infinity },
];

const DISCOUNT_OPTIONS = [
  { label: "Any Discount",  min: 0  },
  { label: "10%+ off",      min: 10 },
  { label: "20%+ off",      min: 20 },
  { label: "30%+ off",      min: 30 },
  { label: "50%+ off",      min: 50 },
];

const SORT_OPTIONS = [
  { value: "default",      label: "Featured"         },
  { value: "price-asc",   label: "Price: Low → High" },
  { value: "price-desc",  label: "Price: High → Low" },
  { value: "discount",    label: "Best Discount"     },
  { value: "name-asc",    label: "Name: A → Z"      },
  { value: "name-desc",   label: "Name: Z → A"      },
];

const SIZES_ALL = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "Free Size"];

/* ── helpers ──────────────────────────────────────────── */
const discountedPrice = (p) =>
  Math.round((p.price || 0) * (1 - (p.discountPercent || p.discount_percent || 0) / 100));

const getGender = (p) =>
  p.genderCategory || p.gender_category || p.categoryName || p.category_name || "Other";

/* ── component ────────────────────────────────────────── */
export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  /* filter state */
  const [search,        setSearch]        = useState(searchParams.get("q")        || "");
  const [genderTab,     setGenderTab]     = useState(searchParams.get("gender")   || "All");
  const [priceRange,    setPriceRange]    = useState(searchParams.get("price")    || "");
  const [minDiscount,   setMinDiscount]   = useState(Number(searchParams.get("disc") || 0));
  const [selectedSizes, setSelectedSizes] = useState(() => {
    const s = searchParams.get("sizes");
    return s ? s.split(",") : [];
  });
  const [inStockOnly,   setInStockOnly]   = useState(false);
  const [onSaleOnly,    setOnSaleOnly]    = useState(false);
  const [sortBy,        setSortBy]        = useState(searchParams.get("sort") || "default");
  const [customMin,     setCustomMin]     = useState("");
  const [customMax,     setCustomMax]     = useState("");
  const [page,          setPage]          = useState(1);
  const PER_PAGE = 12;

  const searchRef = useRef(null);

  /* fetch products */
  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(r => r.json())
      .then(data => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() =>
        setAllProducts([
          { productId:1,  productName:"Floral Wrap Dress",    price:1299, discountPercent:10, description:"Elegant summer wrap dress.",         imageUrl:"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", genderCategory:"Women" },
          { productId:2,  productName:"Casual Denim Jacket",  price:1899, discountPercent:15, description:"Classic blue denim jacket.",          imageUrl:"https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400", genderCategory:"Women" },
          { productId:3,  productName:"Slim Fit Chinos",      price:999,  discountPercent:5,  description:"Modern slim fit chino pants.",        imageUrl:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", genderCategory:"Men"   },
          { productId:4,  productName:"Oxford Button Shirt",  price:1199, discountPercent:0,  description:"Classic oxford cotton shirt.",        imageUrl:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", genderCategory:"Men"   },
          { productId:5,  productName:"Maxi Boho Skirt",      price:799,  discountPercent:20, description:"Bohemian style maxi skirt.",          imageUrl:"https://images.unsplash.com/photo-1583496661160-fb5218afa9a7?w=400", genderCategory:"Women" },
          { productId:6,  productName:"Kids Printed Tee",     price:399,  discountPercent:0,  description:"Colorful printed t-shirt.",           imageUrl:"https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=400", genderCategory:"Kids"  },
          { productId:7,  productName:"Silk Evening Gown",    price:5999, discountPercent:25, description:"Stunning silk evening gown.",         imageUrl:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400", genderCategory:"Women" },
          { productId:8,  productName:"Leather Biker Jacket", price:4499, discountPercent:10, description:"Premium leather biker jacket.",       imageUrl:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", genderCategory:"Men"   },
          { productId:9,  productName:"Floral Midi Dress",    price:1599, discountPercent:30, description:"Beautiful floral midi dress.",        imageUrl:"https://images.unsplash.com/photo-1594938298603-c8148c4b4f7c?w=400", genderCategory:"Women" },
          { productId:10, productName:"Kids Denim Overalls",  price:699,  discountPercent:5,  description:"Cute denim overalls for kids.",       imageUrl:"https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400", genderCategory:"Kids"  },
          { productId:11, productName:"Luxury Watch",         price:8999, discountPercent:0,  description:"Elegant stainless steel timepiece.",  imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", genderCategory:"Accessories" },
          { productId:12, productName:"Leather Handbag",      price:3499, discountPercent:20, description:"Premium genuine leather handbag.",    imageUrl:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", genderCategory:"Accessories" },
          { productId:13, productName:"Linen Trousers",       price:1399, discountPercent:15, description:"Breathable linen trousers.",          imageUrl:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400", genderCategory:"Men"   },
          { productId:14, productName:"Sundress Stripes",     price:899,  discountPercent:0,  description:"Playful striped sundress.",           imageUrl:"https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=400", genderCategory:"Women" },
          { productId:15, productName:"Kids Hoodie",          price:549,  discountPercent:10, description:"Cosy hoodie for little ones.",        imageUrl:"https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400", genderCategory:"Kids"  },
          { productId:16, productName:"Silk Scarf",           price:1299, discountPercent:0,  description:"Luxurious 100% silk scarf.",          imageUrl:"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400", genderCategory:"Accessories" },
        ])
      )
      .finally(() => setLoading(false));
  }, []);

  /* sync URL params */
  useEffect(() => {
    const params = {};
    if (search)              params.q      = search;
    if (genderTab !== "All") params.gender = genderTab;
    if (priceRange)          params.price  = priceRange;
    if (minDiscount)         params.disc   = String(minDiscount);
    if (selectedSizes.length) params.sizes = selectedSizes.join(",");
    if (sortBy !== "default") params.sort  = sortBy;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [search, genderTab, priceRange, minDiscount, selectedSizes, sortBy]);

  /* filtering */
  const filtered = useCallback(() => {
    let list = [...allProducts];

    // gender tab
    if (genderTab !== "All") {
      list = list.filter(p => getGender(p).toLowerCase() === genderTab.toLowerCase());
    }

    // text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.productName || p.product_name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }

    // price range
    if (priceRange) {
      const found = PRICE_RANGES.find(r => r.label === priceRange);
      if (found) list = list.filter(p => {
        const fp = discountedPrice(p);
        return fp >= found.min && fp <= found.max;
      });
    }
    // custom price
    if (customMin !== "" || customMax !== "") {
      const mn = Number(customMin) || 0;
      const mx = Number(customMax) || Infinity;
      list = list.filter(p => { const fp = discountedPrice(p); return fp >= mn && fp <= mx; });
    }

    // discount
    if (minDiscount > 0) {
      list = list.filter(p => (p.discountPercent || p.discount_percent || 0) >= minDiscount);
    }

    // on sale
    if (onSaleOnly) {
      list = list.filter(p => (p.discountPercent || p.discount_percent || 0) > 0);
    }

    // sort
    switch (sortBy) {
      case "price-asc":  list.sort((a,b) => discountedPrice(a) - discountedPrice(b)); break;
      case "price-desc": list.sort((a,b) => discountedPrice(b) - discountedPrice(a)); break;
      case "discount":   list.sort((a,b) => (b.discountPercent || b.discount_percent || 0) - (a.discountPercent || a.discount_percent || 0)); break;
      case "name-asc":   list.sort((a,b) => (a.productName||"").localeCompare(b.productName||"")); break;
      case "name-desc":  list.sort((a,b) => (b.productName||"").localeCompare(a.productName||"")); break;
      default: break;
    }

    return list;
  }, [allProducts, genderTab, search, priceRange, customMin, customMax, minDiscount, onSaleOnly, sortBy]);

  const results   = filtered();
  const total     = results.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const paginated = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeFilterCount = [
    search, priceRange, minDiscount > 0, onSaleOnly, inStockOnly, selectedSizes.length > 0,
    customMin !== "", customMax !== ""
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch(""); setPriceRange(""); setMinDiscount(0);
    setOnSaleOnly(false); setInStockOnly(false);
    setSelectedSizes([]); setCustomMin(""); setCustomMax("");
    setSortBy("default"); setGenderTab("All"); setPage(1);
    if (searchRef.current) searchRef.current.value = "";
  };

  const toggleSize = (s) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  /* ── render ── */
  return (
    <>
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 68px)", background: "var(--bg)" }}>

        {/* ── Hero banner ── */}
        <div style={{
          background: "linear-gradient(135deg, #0d0d12 0%, #12101a 50%, #0a0e12 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "3rem 2rem 2.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* decorative orbs */}
          <div style={{ position:"absolute", top:"-60px", left:"10%",  width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(232,180,160,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-80px", right:"5%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, rgba(126,205,200,0.05) 0%, transparent 70%)", pointerEvents:"none" }} />

          <div style={{ maxWidth:1260, margin:"0 auto", position:"relative", zIndex:1 }}>
            <div className="breadcrumb" style={{ marginBottom:"1rem" }}>
              <Link to="/products">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span style={{ color:"var(--rose)" }}>Categories</span>
            </div>
            <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(2rem,4vw,3.2rem)", color:"var(--text)", fontWeight:600, marginBottom:"0.4rem", letterSpacing:"-0.01em" }}>
              Browse Collections
            </h1>
            <p style={{ color:"var(--text-2)", fontSize:"0.9rem" }}>
              {loading ? "Loading…" : `${total} style${total !== 1 ? "s" : ""} curated for you`}
            </p>

            {/* Gender tab strip */}
            <div style={{ display:"flex", gap:"0.5rem", marginTop:"1.8rem", flexWrap:"wrap" }}>
              {GENDER_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setGenderTab(tab); setPage(1); }}
                  style={{
                    padding:"0.5rem 1.3rem",
                    borderRadius:"30px",
                    border: genderTab === tab ? "1px solid var(--rose)" : "1px solid var(--border)",
                    background: genderTab === tab ? "var(--rose-dim)" : "rgba(255,255,255,0.03)",
                    color: genderTab === tab ? "var(--rose)" : "var(--text-2)",
                    fontWeight: genderTab === tab ? 600 : 400,
                    fontSize:"0.85rem",
                    cursor:"pointer",
                    transition:"all 0.2s",
                    fontFamily:"'Outfit', sans-serif",
                    letterSpacing:"0.04em",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div style={{ maxWidth:1260, margin:"0 auto", padding:"0 1.5rem 4rem", display:"flex", gap:"2rem", alignItems:"flex-start" }}>

          {/* ══ SIDEBAR ══ */}
          <>
            {/* Mobile overlay */}
            {sidebarOpen && (
              <div
                onClick={() => setSidebarOpen(false)}
                style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", zIndex:900 }}
              />
            )}

            <aside style={{
              width: 268,
              flexShrink: 0,
              position: "sticky",
              top: 80,
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              paddingRight: "0.5rem",
              scrollbarWidth: "thin",
              /* mobile: slide-in drawer */
              ...(typeof window !== "undefined" && window.innerWidth < 960 ? {
                position: "fixed", top: 0, left: sidebarOpen ? 0 : "-320px",
                height: "100vh", width: 300, zIndex: 950,
                background: "var(--bg-2)", overflowY: "auto",
                padding: "1.5rem", transition: "left 0.32s cubic-bezier(0.4,0,0.2,1)",
                borderRight: "1px solid var(--border)",
              } : {}),
            }}>

              <style>{`
                @media (max-width: 960px) {
                  .cat-sidebar { position:fixed!important; top:0!important; height:100vh!important; width:300px!important; z-index:950!important; background:var(--bg-2)!important; overflow-y:auto!important; padding:1.5rem!important; border-right:1px solid var(--border)!important; transition:left 0.32s cubic-bezier(0.4,0,0.2,1)!important; }
                  .cat-sidebar.open { left:0!important; }
                  .cat-sidebar.closed { left:-320px!important; }
                  .sidebar-backdrop { display:block!important; }
                  .cat-main-col { margin-left:0!important; }
                }
                @media (min-width: 961px) {
                  .cat-sidebar { position:sticky!important; top:80px!important; max-height:calc(100vh - 100px)!important; overflow-y:auto!important; }
                  .cat-mobile-toggle { display:none!important; }
                }
                .filter-section { margin-bottom:1.6rem; padding-bottom:1.6rem; border-bottom:1px solid var(--border); }
                .filter-section:last-child { border-bottom:none; margin-bottom:0; }
                .filter-section-title { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--text-3); margin-bottom:0.9rem; display:flex; align-items:center; gap:0.4rem; }
                .filter-section-title::after { content:''; flex:1; height:1px; background:var(--border); }
                .filter-check { display:flex; align-items:center; gap:0.65rem; padding:0.45rem 0; cursor:pointer; }
                .filter-check input[type=radio], .filter-check input[type=checkbox] { accent-color:var(--rose); width:15px; height:15px; cursor:pointer; }
                .filter-check label { font-size:0.86rem; color:var(--text-2); cursor:pointer; transition:color 0.2s; flex:1; }
                .filter-check:hover label { color:var(--text); }
                .size-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.4rem; }
                .size-chip { padding:0.4rem 0.3rem; border-radius:6px; border:1px solid var(--border); background:var(--bg-3); color:var(--text-2); cursor:pointer; font-size:0.75rem; text-align:center; transition:all 0.2s; font-family:'Outfit',sans-serif; }
                .size-chip.active { border-color:var(--rose); color:var(--rose); background:var(--rose-dim); font-weight:600; }
                .size-chip:hover:not(.active) { border-color:var(--border-hover); color:var(--text); }
                .custom-price-row { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.5rem; }
                .custom-price-input { background:var(--bg-3); border:1px solid var(--border); border-radius:8px; padding:0.5rem 0.7rem; color:var(--text); font-family:'Outfit',sans-serif; font-size:0.82rem; outline:none; width:100%; transition:border-color 0.2s; }
                .custom-price-input:focus { border-color:var(--rose); }
                .custom-price-input::placeholder { color:var(--text-3); }
                .toggle-switch { position:relative; width:38px; height:20px; flex-shrink:0; }
                .toggle-switch input { opacity:0; width:0; height:0; }
                .toggle-slider { position:absolute; inset:0; background:var(--surface-3); border-radius:20px; cursor:pointer; transition:background 0.2s; }
                .toggle-slider::after { content:''; position:absolute; width:14px; height:14px; left:3px; top:3px; background:#fff; border-radius:50%; transition:transform 0.2s; }
                .toggle-switch input:checked + .toggle-slider { background:var(--rose); }
                .toggle-switch input:checked + .toggle-slider::after { transform:translateX(18px); }
              `}</style>

              <div className={`cat-sidebar ${sidebarOpen ? "open" : "closed"}`}
                style={{ paddingTop:"1.5rem" }}>

                {/* Sidebar header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", color:"var(--text)", fontWeight:600 }}>
                    Filters
                    {activeFilterCount > 0 && (
                      <span style={{ marginLeft:"0.5rem", background:"var(--rose)", color:"#0a0a0b", fontSize:"0.65rem", fontWeight:700, padding:"0.1rem 0.45rem", borderRadius:"20px" }}>
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAll} style={{ background:"none", border:"none", color:"var(--rose)", fontSize:"0.78rem", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                      Clear all
                    </button>
                  )}
                </div>

                {/* ── Search ── */}
                <div className="filter-section">
                  <div className="filter-section-title">Search</div>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:"0.8rem", top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </span>
                    <input
                      ref={searchRef}
                      defaultValue={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search products…"
                      style={{ width:"100%", background:"var(--bg-3)", border:"1px solid var(--border)", borderRadius:"8px", padding:"0.6rem 0.8rem 0.6rem 2.2rem", color:"var(--text)", fontFamily:"'Outfit',sans-serif", fontSize:"0.85rem", outline:"none", transition:"border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = "var(--rose)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>
                </div>

                {/* ── Price range ── */}
                <div className="filter-section">
                  <div className="filter-section-title">Price Range</div>
                  {PRICE_RANGES.map(r => (
                    <label key={r.label} className="filter-check">
                      <input
                        type="radio" name="price"
                        checked={priceRange === r.label}
                        onChange={() => { setPriceRange(r.label); setCustomMin(""); setCustomMax(""); setPage(1); }}
                      />
                      <label style={{ color: priceRange === r.label ? "var(--rose)" : undefined }}>{r.label}</label>
                    </label>
                  ))}
                  {priceRange && (
                    <label className="filter-check" style={{ marginTop:"0.2rem" }}>
                      <input type="radio" name="price" checked={priceRange === ""} onChange={() => setPriceRange("")} />
                      <label style={{ color:"var(--text-3)" }}>Clear selection</label>
                    </label>
                  )}
                  {/* Custom price */}
                  <div style={{ marginTop:"0.9rem" }}>
                    <div style={{ fontSize:"0.75rem", color:"var(--text-3)", marginBottom:"0.4rem" }}>Custom range (₹)</div>
                    <div className="custom-price-row">
                      <input className="custom-price-input" type="number" placeholder="Min" value={customMin}
                        onChange={e => { setCustomMin(e.target.value); setPriceRange(""); setPage(1); }} />
                      <input className="custom-price-input" type="number" placeholder="Max" value={customMax}
                        onChange={e => { setCustomMax(e.target.value); setPriceRange(""); setPage(1); }} />
                    </div>
                  </div>
                </div>

                {/* ── Discount ── */}
                <div className="filter-section">
                  <div className="filter-section-title">Discount</div>
                  {DISCOUNT_OPTIONS.map(d => (
                    <label key={d.label} className="filter-check">
                      <input
                        type="radio" name="discount"
                        checked={minDiscount === d.min}
                        onChange={() => { setMinDiscount(d.min); setPage(1); }}
                      />
                      <label style={{ color: minDiscount === d.min ? "var(--rose)" : undefined }}>{d.label}</label>
                    </label>
                  ))}
                </div>

                {/* ── Size ── */}
                <div className="filter-section">
                  <div className="filter-section-title">Size</div>
                  <div className="size-grid">
                    {SIZES_ALL.map(s => (
                      <button key={s} className={`size-chip ${selectedSizes.includes(s) ? "active" : ""}`}
                        onClick={() => { toggleSize(s); setPage(1); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {selectedSizes.length > 0 && (
                    <button onClick={() => setSelectedSizes([])}
                      style={{ marginTop:"0.6rem", background:"none", border:"none", color:"var(--text-3)", fontSize:"0.75rem", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                      Clear sizes
                    </button>
                  )}
                </div>

                {/* ── Toggles ── */}
                <div className="filter-section">
                  <div className="filter-section-title">Options</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.86rem", color:"var(--text-2)" }}>On Sale Only</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={onSaleOnly} onChange={e => { setOnSaleOnly(e.target.checked); setPage(1); }} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.86rem", color:"var(--text-2)" }}>In Stock</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={inStockOnly} onChange={e => { setInStockOnly(e.target.checked); setPage(1); }} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Mobile close */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="cat-mobile-toggle"
                  style={{ display:"none", width:"100%", padding:"0.9rem", background:"var(--rose)", color:"#0a0a0b", border:"none", borderRadius:"10px", fontFamily:"'Outfit',sans-serif", fontWeight:700, cursor:"pointer", fontSize:"0.9rem", marginTop:"1rem" }}
                >
                  Show {total} Results
                </button>
              </div>
            </aside>
          </>

          {/* ══ MAIN CONTENT ══ */}
          <div className="cat-main-col" style={{ flex:1, minWidth:0, paddingTop:"1.8rem" }}>

            {/* Toolbar */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.4rem", gap:"1rem", flexWrap:"wrap" }}>
              {/* Mobile filter toggle */}
              <button
                className="cat-mobile-toggle"
                onClick={() => setSidebarOpen(true)}
                style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.55rem 1.1rem", borderRadius:"8px", border:"1px solid var(--border)", background:"var(--surface)", color:"var(--text-2)", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:"0.84rem", fontWeight:500 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              {/* Results count */}
              <span style={{ fontSize:"0.84rem", color:"var(--text-2)", marginRight:"auto" }}>
                <span style={{ color:"var(--rose)", fontWeight:600 }}>{total}</span> items
              </span>

              {/* Sort */}
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                <span style={{ fontSize:"0.78rem", color:"var(--text-3)", whiteSpace:"nowrap" }}>Sort by</span>
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setPage(1); }}
                  style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", padding:"0.5rem 0.8rem", fontFamily:"'Outfit',sans-serif", fontSize:"0.84rem", cursor:"pointer", outline:"none" }}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Active filter pills */}
            {activeFilterCount > 0 && (
              <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
                {search && (
                  <FilterPill label={`"${search}"`} onRemove={() => { setSearch(""); if (searchRef.current) searchRef.current.value = ""; }} />
                )}
                {priceRange && <FilterPill label={priceRange} onRemove={() => setPriceRange("")} />}
                {(customMin || customMax) && (
                  <FilterPill label={`₹${customMin||0} – ₹${customMax||"∞"}`} onRemove={() => { setCustomMin(""); setCustomMax(""); }} />
                )}
                {minDiscount > 0 && <FilterPill label={`${minDiscount}%+ off`} onRemove={() => setMinDiscount(0)} />}
                {onSaleOnly && <FilterPill label="On Sale" onRemove={() => setOnSaleOnly(false)} />}
                {inStockOnly && <FilterPill label="In Stock" onRemove={() => setInStockOnly(false)} />}
                {selectedSizes.map(s => <FilterPill key={s} label={`Size: ${s}`} onRemove={() => toggleSize(s)} />)}
                <button onClick={clearAll}
                  style={{ padding:"0.25rem 0.75rem", borderRadius:"20px", border:"1px solid rgba(224,112,112,0.3)", background:"rgba(224,112,112,0.06)", color:"var(--danger)", fontSize:"0.75rem", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                  Clear all ×
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"1.2rem" }}>
                {Array.from({length:8}).map((_,i) => (
                  <div key={i} className="skeleton" style={{ height:340, borderRadius:14 }} />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon" style={{ fontSize:"3rem" }}>🔍</span>
                <h3>No products found</h3>
                <p style={{ marginBottom:"1.5rem" }}>Try adjusting your filters or search term.</p>
                <button onClick={clearAll} className="btn btn-rose">Clear Filters</button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"1.2rem" }}>
                {paginated.map((p, idx) => {
                  const pId       = p.productId || p.product_id;
                  const pName     = p.productName || p.product_name || "";
                  const pImage    = p.imageUrl || p.image_url || "https://via.placeholder.com/300";
                  const pDiscount = p.discountPercent || p.discount_percent || 0;
                  const pCat      = getGender(p);
                  const origPrice = p.price || 0;
                  const finalP    = discountedPrice(p);

                  return (
                    <Link
                      to={`/product/${pId}`}
                      key={pId}
                      className="product-card"
                      style={{ animationDelay:`${Math.min(idx,7)*0.06}s`, textDecoration:"none", color:"inherit", display:"block" }}
                    >
                      <div className="product-card-img-wrap" style={{ position:"relative" }}>
                        <img src={pImage} alt={pName} className="product-card-img" />
                        {pDiscount > 0 && (
                          <span style={{
                            position:"absolute", top:10, left:10,
                            background:"var(--rose)", color:"#0a0a0b",
                            fontSize:"0.65rem", fontWeight:700, padding:"3px 9px",
                            borderRadius:"20px", letterSpacing:"0.04em",
                          }}>
                            -{pDiscount}%
                          </span>
                        )}
                        {/* Quick-view hint */}
                        <div style={{
                          position:"absolute", inset:0,
                          background:"rgba(5,5,7,0.35)",
                          display:"flex", alignItems:"flex-end", justifyContent:"center",
                          padding:"1rem",
                          opacity:0, transition:"opacity 0.25s",
                          borderRadius:"inherit",
                        }}
                          className="product-card-overlay"
                        >
                          <span style={{ background:"rgba(232,180,160,0.9)", color:"#0a0a0b", fontSize:"0.78rem", fontWeight:700, padding:"0.4rem 1.2rem", borderRadius:"30px", fontFamily:"'Outfit',sans-serif" }}>
                            View Details →
                          </span>
                        </div>
                      </div>
                      <div className="product-card-body">
                        <div className="product-card-cat">{pCat}</div>
                        <h3 className="product-card-name">{pName}</h3>
                        <div className="product-card-footer">
                          <div>
                            <span className="product-price">₹{finalP.toLocaleString()}</span>
                            {pDiscount > 0 && (
                              <span className="product-original-price">₹{origPrice.toLocaleString()}</span>
                            )}
                          </div>
                          <span style={{ fontSize:"0.75rem", color:"var(--rose)", fontWeight:600 }}>→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:"0.4rem", marginTop:"2.5rem", flexWrap:"wrap" }}>
                <button
                  onClick={() => { setPage(1); window.scrollTo(0,0); }}
                  disabled={page === 1}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize:"0.78rem" }}
                >« First</button>
                <button
                  onClick={() => { setPage(p => Math.max(1,p-1)); window.scrollTo(0,0); }}
                  disabled={page === 1}
                  className="btn btn-ghost btn-sm"
                >Prev</button>

                {Array.from({length: Math.min(7, totalPages)}, (_,i) => {
                  let num;
                  if (totalPages <= 7)      num = i + 1;
                  else if (page <= 4)       num = i + 1;
                  else if (page >= totalPages - 3) num = totalPages - 6 + i;
                  else                      num = page - 3 + i;
                  if (num < 1 || num > totalPages) return null;
                  return (
                    <button
                      key={num}
                      onClick={() => { setPage(num); window.scrollTo(0,0); }}
                      className={`btn btn-sm ${page === num ? "btn-rose" : "btn-ghost"}`}
                      style={{ width:36, height:36, padding:0, justifyContent:"center" }}
                    >{num}</button>
                  );
                })}

                <button
                  onClick={() => { setPage(p => Math.min(totalPages,p+1)); window.scrollTo(0,0); }}
                  disabled={page === totalPages}
                  className="btn btn-ghost btn-sm"
                >Next</button>
                <button
                  onClick={() => { setPage(totalPages); window.scrollTo(0,0); }}
                  disabled={page === totalPages}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize:"0.78rem" }}
                >Last »</button>
              </div>
            )}
          </div>
        </div>

        {/* overlay css for hover effect */}
        <style>{`
          .product-card:hover .product-card-overlay { opacity:1!important; }
          @media (max-width:960px) {
            .cat-main-col { padding-top:1.2rem; }
          }
          @media (max-width:600px) {
            .cat-main-col > div[style*="grid"] { grid-template-columns:repeat(2,1fr)!important; gap:0.75rem!important; }
          }
        `}</style>
      </div>
    </>
  );
}

/* ── tiny pill component ── */
function FilterPill({ label, onRemove }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:"0.35rem",
      padding:"0.25rem 0.7rem", borderRadius:"20px",
      border:"1px solid rgba(232,180,160,0.25)",
      background:"var(--rose-dim)", color:"var(--rose)",
      fontSize:"0.76rem", fontWeight:600,
    }}>
      {label}
      <button onClick={onRemove} style={{ background:"none", border:"none", color:"var(--rose)", cursor:"pointer", fontSize:"0.9rem", lineHeight:1, padding:0 }}>×</button>
    </span>
  );
}