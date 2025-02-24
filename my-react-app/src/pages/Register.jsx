import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [flag, setFlag] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== repeatedPassword) {
      setFlag(true);
      setSuccessMessage("");
      setErrorMessage("");
      return;
    }
    setFlag(false);

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || "User registered successfully!");
        setErrorMessage("");
        setUsername("");
        setPassword("");
        setRepeatedPassword("");
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Username or password already exists."
        );
        setSuccessMessage("");
      }
    } catch (err) {
      console.error("Wystąpił błąd:", err);
      setErrorMessage("Something went wrong. Please try again later.");
      setSuccessMessage("");
    }
  };

  return (
    <div>
      <Navbar />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <input
          type="password"
          value={repeatedPassword}
          onChange={(e) => setRepeatedPassword(e.target.value)}
          placeholder="Repeat Password"
        />
        {flag && <p style={{ color: "red" }}>Passwords do not match</p>}
        <button type="submit">Register</button>
      </form>

      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <Link to="/login">Already have an account? Login here</Link>
    </div>
  );
};

export default Register;
