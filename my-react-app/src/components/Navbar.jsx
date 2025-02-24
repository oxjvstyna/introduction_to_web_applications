import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Home</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/bucket">Koszyk</Link>
        </li>

        <li>
          <Link to="/login">Logowanie</Link>
        </li>

        <li>
          <Link to="/register">Rejestracja</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
