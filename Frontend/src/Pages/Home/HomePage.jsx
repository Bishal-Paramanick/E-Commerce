import { Header } from "../../Components/Header";
import "./HomePage.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { ProductsGrid } from "./productsGrid";
import { useSearchParams,useNavigate } from "react-router";
export function HomePage({ cart,loadCart }) {
  const [products, setProducts] = useState([]);
  const [searchParams]=useSearchParams();
  const search=searchParams.get('search');
  const navigate=useNavigate();
  useEffect(() => {
    const getHomeData = async () => {
      try{

        const apiUrl = search ? `/api/products?search=${search}` : "/api/products";
        const response = await axios.get(apiUrl);
        if(search&&response.data.length===0){
          navigate('/*');
          return;
        }
        setProducts(response.data);
      }catch(error){
        if (error.response && error.response.status === 404) {
          navigate('/not-found');
        } else {
          console.error("Error fetching products:", error);
        }
      }
    };
    getHomeData();
  }, [search,navigate]);
  return (
    <>
      <title>HomePage</title>
      <Header cart={cart} />
      <div className="home-page">
        <ProductsGrid products={products} loadCart={loadCart} />
      </div>
    </>
  );
}
