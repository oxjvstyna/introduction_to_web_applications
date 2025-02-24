import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/CartPage.css";
import "../styles/Navbar.css";

function CartPage({ userId }) {
  const [cart, setCart] = useState([]);
  const [orderAccepted, setOrderAccepted] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/productsInCarts/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setCart(data.products);
      })
      .catch((err) => console.error("Error fetching cart data:", err));
  }, [userId]);

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const removeProductFromCart = (productId) => {
    fetch(`http://localhost:5000/api/productsInCarts/${productId}/${userId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        setCart(cart.filter((item) => item.productID !== productId));
      })
      .catch((err) => console.error("Error removing product:", err));
  };

  const acceptCart = () => {
    fetch(`http://localhost:5000/api/acceptCart/${userId}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        setOrderAccepted(true);
        setCart([]);
      })
      .catch((err) => console.error("Error accepting cart:", err));
  };

  return (
    <div>
      <Navbar />
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.productID}>
                <h2>{item.title}</h2>
                <p>Price: ${item.price.toFixed(2)}</p>
                <p>Quantity: {item.quantity}</p>
                <img src={item.image} alt={item.title} />
                <button onClick={() => removeProductFromCart(item.productID)}>
                  Remove from Cart
                </button>
              </li>
            ))}
          </ul>
          <div>
            <h3>Total: ${calculateTotal()}</h3>
            <button onClick={acceptCart}>Place Order</button>
          </div>
        </>
      )}
      {orderAccepted && <p>Order has been successfully placed!</p>}
    </div>
  );
}

export default CartPage;
