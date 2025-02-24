import React from "react";

const Reviews = ({ reviews }) => {
  return (
    <div className="reviews-section">
      <h3>Opinie:</h3>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} className="review">
            <p>
              <strong>{review.username || "Anonimowy użytkownik"}:</strong>
            </p>
            <p>
              <strong>Ocena:</strong> {review.rating} / 5
            </p>
            <p>
              <strong>Opinia:</strong> {review.body}
            </p>
          </div>
        ))
      ) : (
        <p>Brak opinii dla tego produktu.</p>
      )}
    </div>
  );
};

export default Reviews;
