// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseGeneration from './pages/LandingPage';
import ModuleGeneration from './pages/AIModule';
import ChapterGeneration from './pages/ChapterPage';
function App() {
  return (
    <Router>
     <Routes>
         <Route path="/" element={<CourseGeneration />} /> 
      </Routes>
      <Routes>
         <Route path="/modules" element={<ModuleGeneration />} /> 
      </Routes>
      <Routes>
         <Route path="/chapters" element={<ChapterGeneration />} /> 
      </Routes>
    </Router>
  );
}

export default App;
