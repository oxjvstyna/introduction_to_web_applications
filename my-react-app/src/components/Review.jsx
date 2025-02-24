import React, { useEffect, useState } from "react";

const Review = ({ review, user, refreshReviews }) => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newBody, setNewBody] = useState(review.body);
  const [newRating, setNewRating] = useState(review.rating);
  const [newDate, setNewDate] = useState(review.data);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        const data = await response.json();
        setUsers(data.users);

        const user = data.users.find((user) => user.id === review.userID);
        if (user) {
          setUsername(user.username);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [review.userID]);

  useEffect(() => {
    if (user !== -1) {
      setUserID(user.id);
    }
  }, [user]);

  const editReview = async () => {
    if (
      !parseFloat(newRating) ||
      parseFloat(newRating) < 1 ||
      parseFloat(newRating) > 5
    ) {
      alert("Rating should be a number between 1 and 5");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${comment.userID}/${comment.productID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newBody,
            newRating,
            newData: newDate,
          }),
        }
      );

      if (response.ok) {
        alert("Review updated successfully!");
        setIsEditing(false);
        refreshReviews();
      }
    } catch (error) {
      console.error("Error editing review:", error);
    }
  };

  const deleteReview = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${comment.userID}/${comment.productID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Review deleted successfully!");
        setIsDeleting(false);
        refreshReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const cancelEdit = () => setIsEditing(false);

  const handleDelete = () => setIsDeleting(true);

  const cancelDelete = () => setIsDeleting(false);

  return (
    <>
      <div>
        <p>Username: {username}</p>
        <p>Review: {review.body}</p>
        <p>Rating: {review.rating}</p>
        <p>Date: {review.data}</p>

        {(userID === review.userID || userID === 1) && (
          <div>
            {!isEditing && !isDeleting && (
              <>
                <button onClick={handleDelete}>Delete</button>
                <button onClick={handleEdit}>Edit</button>
              </>
            )}

            {isDeleting && (
              <div>
                <p>Are you sure you want to delete this review?</p>
                <button onClick={deleteReview}>Delete</button>
                <button onClick={cancelDelete}>Cancel</button>
              </div>
            )}

            {isEditing && (
              <div>
                <p>Edit your review:</p>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Edit your review here..."
                />
                <input
                  type="number"
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  placeholder="Rating (1-5)"
                />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <button onClick={editReview}>Save Changes</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Review;
