import React from "react";
import { Link } from "react-router-dom";

const Bucket = () => {
  return (
    <div>
      <Link to="/bucket">
        <button>Bucket</button>
      </Link>
    </div>
  );
};

export default Bucket;
