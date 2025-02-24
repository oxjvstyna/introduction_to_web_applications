import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Logo from "../components/logo";
import Bucket from "../components/Bucket";
import ReviewForm from "../components/ReviewForm";
import Reviews from "../components/Reviews";
import Navbar from "../components/Navbar";

const Product = ({ products }) => {
  const { id } = useParams();
  const productId = parseInt(id, 10);
  const [product, setProduct] = useState({});
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canAdd, setCanAdd] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState([]);
  const [averageRating, setAverageRating] = useState(0); // Nowy stan na średnią ocenę
  const [user, setUser] = useState(() => {
    const localData = localStorage.getItem("user");
    return localData ? JSON.parse(localData) : { id: -1 };
  });

  useEffect(() => {
    const selectedProduct = products.find((prod) => prod.id === productId);
    if (selectedProduct) setProduct(selectedProduct);
  }, [productId, products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewsResponse = await fetch(
          `http://localhost:5000/api/comments/${product.id}`
        );
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.comments);

        calculateAverageRating(reviewsData.comments); // Liczymy średnią ocen

        const ordersResponse = await fetch("http://localhost:5000/api/orders");
        const ordersData = await ordersResponse.json();
        const userOrders = ordersData.orders.filter(
          (item) => item.userID === user.id
        );
        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (product?.id) {
      fetchData();
    }
  }, [product.id, user.id]);

  useEffect(() => {
    if (user === -1) {
      setCanAdd(false);
    } else {
      const hasReviewed = reviews?.some((review) => review.userID === user.id);
      const hasPurchased = orders?.some(
        (order) => order.productID === product.id
      );
      setCanAdd(!hasReviewed && hasPurchased);
    }
  }, [reviews, orders, product.id, user.id]);

  // Funkcja licząca średnią ocen
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(0);
      return;
    }
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating((total / reviews.length).toFixed(1)); // Zaokrąglamy do 1 miejsca po przecinku
  };

  const addToCart = async () => {
    if (user === -1) {
      alert("You must log in to add products to your cart.");
    } else if (quantity < 1 || quantity > product.quantity) {
      alert("Quantity should be between 1 and the remaining quantity.");
    } else {
      try {
        await fetch("http://localhost:5000/productsInCarts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid: user.id,
            productid: product.id,
            quantity: quantity,
          }),
        });
        alert("Added to cart successfully!");
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  const refreshReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${product.id}`
      );
      const data = await response.json();
      setReviews(data.comments);
      calculateAverageRating(data.comments); // Aktualizujemy średnią ocen
      setCanAdd(false);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const createForm = () => {
    setIsReviewFormVisible(true);
  };

  return (
    <>
      <Navbar />
      <Logo />
      <div className="loginBucket">
        <Bucket />
      </div>
      <div className="productDetails">
        {isLoading ? (
          <p>Loading product details...</p>
        ) : (
          <>
            <h2>{product.title}</h2>
            <img src={product.image} alt={product.title} />
            <p>
              <strong>Description:</strong> {product.description}
            </p>
            <p>
              <strong>Price:</strong> ${product.price}
            </p>
            <p>
              <strong>Rating:</strong> {averageRating} / 5
            </p>{" "}
            {/* Używamy średniej */}
            <p>
              <strong>Available Quantity:</strong> {product.quantity}
            </p>
            <div>
              <label>Quantity:</label>
              <input
                type="number"
                value={quantity}
                min="1"
                max={product.quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <button onClick={addToCart}>Add to Cart</button>
          </>
        )}
      </div>

      {canAdd && <button onClick={createForm}>Add Opinion</button>}

      <ReviewForm
        userid={user.id}
        productid={product.id}
        isVisible={isReviewFormVisible}
        refreshReviews={refreshReviews}
      />

      <Reviews reviews={reviews} />
    </>
  );
};

export default Product;
