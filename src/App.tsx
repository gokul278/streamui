// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Room from './pages/Room';
import HomePage from './pages/Homepage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomId" element={<Room />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
