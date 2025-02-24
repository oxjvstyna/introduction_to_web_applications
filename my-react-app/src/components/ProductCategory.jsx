import { useState, useEffect } from "react";
import Input from "./Input";

const ProductCategory = ({ products }) => {
  const [newProducts, setNewProducts] = useState([]);
  const [category, setCategory] = useState("All products");

  useEffect(() => {
    setNewProducts(products);
  }, [products]);

  const filterByCategory = (category) => {
    if (category === "All products") {
      setNewProducts(products);
    } else {
      const filteredProducts = products.filter(
        (product) => product.category === category
      );
      setNewProducts(filteredProducts);
    }
    setCategory(category);
  };

  return (
    <div>
      <div className="category-buttons">
        <button onClick={() => filterByCategory("men's clothing")}>
          Men's Clothing
        </button>
        <button onClick={() => filterByCategory("women's clothing")}>
          Women's Clothing
        </button>
        <button onClick={() => filterByCategory("jewelery")}>Jewelry</button>
        <button onClick={() => filterByCategory("electronics")}>
          Electronics
        </button>
        <button onClick={() => filterByCategory("All products")}>
          All Products
        </button>
      </div>

      <Input products={newProducts} category={category} />
    </div>
  );
};

export default ProductCategory;
