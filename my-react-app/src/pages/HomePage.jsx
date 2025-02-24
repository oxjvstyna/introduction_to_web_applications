import React, { useState } from "react";
import Products from "../components/Products";
import Bucket from "../components/Bucket";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = ({ products }) => {
  const [user, setUser] = useState(() => {
    const localData = localStorage.getItem("user");
    return localData ? JSON.parse(localData) : -1;
  });

  return (
    <>
      <Navbar />
      <div className="app">
        <div>
          <div></div>
          <div className="loginBucket">
            {user === -1 ? <Link to={`/login`}>Bucket</Link> : <Bucket />}
          </div>
        </div>
        <div className="home_nav_prod">
          <div>
            <Products products={products} />
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
};

export default Home;
