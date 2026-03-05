import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Ratings from "./pages/Ratings";
import Analysis from "./pages/Analysis";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ratings/:handle" element={<Ratings />} />
        <Route path="/analysis/:handle" element={<Analysis />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}
