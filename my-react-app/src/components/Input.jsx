import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

const Input = ({ products, category }) => {
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    const filterInput = document.getElementById("filterInput");
    const handleInput = () => {
      const filterValue = filterInput.value.toLowerCase();
      const updateProducts = products.filter((product) =>
        product.title.toLowerCase().includes(filterValue)
      );
      setFilteredProducts(updateProducts);
    };
    filterInput.addEventListener("input", handleInput);
  }, [filteredProducts]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="categoryText">
                <p>{category}</p>
              </div>
              <div className="filterInput">
                <input id="filterInput" placeholder="Filter products..." />
              </div>
              <div className="productsContainer">
                {filteredProducts.map((product, id) => (
                  <div key={id} className="product">
                    <div></div>
                    <div>
                      <img
                        src={product.image}
                        alt={"productPhoto"}
                        width="100px"
                        height="100px"
                      />
                    </div>
                    <div className="titleproduct">{product.title}</div>
                    <div></div>
                    <div>{product.price} $</div>
                    <Link className="moredetails" to={`product/${product.id}`}>
                      More details
                    </Link>
                  </div>
                ))}
              </div>
            </>
          }
        />
      </Routes>
    </>
  );
};
export default Input;
