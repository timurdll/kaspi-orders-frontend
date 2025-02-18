// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { OrderKaspiDeliveryPage } from "./components/OrderKaspiDeliveryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/:orderId" element={<OrderKaspiDeliveryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
