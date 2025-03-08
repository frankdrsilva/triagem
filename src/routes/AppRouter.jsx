import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TelaInicial from '../pages/TelaInicial';
import CriarEvento from '../pages/CriarEvento';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/criar-evento" element={<CriarEvento />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;