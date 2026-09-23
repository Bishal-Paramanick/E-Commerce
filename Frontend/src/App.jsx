import { HomePage } from "./Pages/Home/HomePage";
import { Route, Routes } from "react-router";
import "./App.css";
import { CheckoutPage } from "./Pages/Checkout/CheckoutPage";
import { OrdersPage } from "./Pages/orders/OrdersPage";
import { TrackingPage } from "./Pages/orders/TrackingPage";
import { NotFound } from "./Pages/NotFound";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

window.axios = axios;

function App() {
  const [cart, setCart] = useState([]);

  const loadCart = useCallback(async () => {
    try {
      const response = await axios.get("/api/cart?expand=product");
      setCart(response.data || []);
    } catch (error) {
      console.error("Error reloading cart data:", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    axios
      .get("/api/cart?expand=product")
      .then((response) => {
        if (isMounted) {
          setCart(response.data || []);
        }
      })
      .catch((error) => {
        console.error("Error during initial cart load:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Routes>
      <Route index element={<HomePage cart={cart} loadCart={loadCart} />} />
      <Route
        path="/checkout"
        element={<CheckoutPage cart={cart} loadCart={loadCart} />}
      />
      <Route
        path="/orders"
        element={<OrdersPage cart={cart} loadCart={loadCart} />}
      />
      <Route
        path="/tracking/:orderId/:productId"
        element={<TrackingPage cart={cart} />}
      />
      <Route path="/*" element={<NotFound cart={cart} />} />
    </Routes>
  );
}

export default App;