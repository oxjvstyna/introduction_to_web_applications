import React, { useState, useEffect } from "react";

const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product))
      .catch((err) => console.error(err));
  }, [productId]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/comments/${productId}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments))
      .catch((err) => console.error(err));
  }, [productId]);

  const addToCart = () => {
    fetch("http://localhost:5000/productsInCarts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: 1,
        productid: productId,
        quantity: quantity,
      }),
    })
      .then((res) => res.json())
      .then((data) => alert(data.message))
      .catch((err) => console.error(err));
  };

  const submitComment = () => {
    fetch("http://localhost:5000/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: 1,
        productid: productId,
        data: new Date().toISOString(),
        body: newComment,
        rating: Number(newRating),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setNewComment("");
        setNewRating(0);

        // Ponowne pobranie komentarzy po dodaniu nowego
        return fetch(`http://localhost:5000/api/comments/${productId}`);
      })
      .then((res) => res.json())
      .then((data) => setComments(data.comments))
      .catch((err) => {
        console.error(err);
        alert("Failed to submit comment");
      });
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{product.title}</h1>
      <img
        src={product.image}
        alt={product.title}
        style={{ maxWidth: "300px" }}
      />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Category: {product.category}</p>
      <label>
        Quantity:
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
      </label>
      <button onClick={addToCart}>Add to Cart</button>

      <h2>Comments</h2>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <p>{comment.body}</p>
            <p>Rating: {comment.rating}</p>
            <p>Date: {comment.data}</p>
          </li>
        ))}
      </ul>

      <h3>Add a Comment</h3>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write your comment"
      ></textarea>
      <br />
      <label>
        Rating:
        <input
          type="number"
          value={newRating}
          onChange={(e) => setNewRating(e.target.value)}
          min="0"
          max="5"
        />
      </label>
      <br />
      <button onClick={submitComment}>Submit Comment</button>
    </div>
  );
};

export default ProductDetails;
