import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ConfirmarPresenca from './pages/ConfirmarPresenca';
import Confirmados from './pages/Confirmados';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/confirmar" element={<ConfirmarPresenca />} />
        <Route path="/confirmados" element={<Confirmados />} />
      </Routes>
    </Router>
  );
}

export default App;
