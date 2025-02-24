import { Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage";
import Product from "./pages/Product";
import CartPage from "./pages/CartPage";
import Register from "./pages/Register";
import LoginPage from "./pages/LoginPage";
import { useEffect, useState } from "react";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
      });
  }, []);

  console.log(products);

  const [userId, setUserId] = useState(() => {
    const localData = localStorage.getItem("userId");
    return localData ? JSON.parse(localData) : -1;
  });

  console.log(userId);

  return (
    <Routes>
      <Route path="*" element={<Home products={products} />} />
      <Route path="product/:id/*" element={<Product products={products} />} />
      <Route path="bucket" element={<CartPage userId={userId} />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
