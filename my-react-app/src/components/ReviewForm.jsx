import React, { useState } from "react";

const ReviewForm = ({ userid, productid, isVisible, refreshReviews }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      alert("Review text cannot be empty");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid,
          productid,
          body: reviewText,
          rating,
          date: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      alert("Review added successfully!");
      setReviewText("");
      setRating(1);
      refreshReviews();
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to add review");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="review-form">
      <h3>Add Your Review</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Rating (1-5):
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
        </label>
        <br />
        <label>
          Your Review:
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your opinion here..."
          />
        </label>
        <br />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default ReviewForm;
