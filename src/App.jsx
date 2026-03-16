<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login />} />

      </Routes>

    </BrowserRouter>

  );
=======
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  
  return <AppRoutes />;
>>>>>>> 6bb69ed1631b2a78c2acf997dd9c938637c519df
}

export default App;