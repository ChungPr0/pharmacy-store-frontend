import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <CartProvider>

      <AppRoutes />
    </CartProvider>
  );
}

export default App;