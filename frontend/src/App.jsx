import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Footer from "./component/Footer";
import ProtectedRoute from "./component/ProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <main style={{ flex: '1 0 auto' }}>
              <Routes>
                {/* Default: go to products */}
                <Route path="/" element={<Navigate to="/products" replace />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Public Routes */}
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/categories" element={<Categories />} />

                {/* Protected Routes */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;