import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home.jsx';
import HeatMap from './pages/heat.jsx';
import Roadmaps from './pages/roadMaps.jsx';
import Filter from './pages/filter';
import Roadmap from './pages/roadMap.jsx'
import AddRoadMap from './components/AddRoadMap.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/heatmap" element={<HeatMap />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/roadmaps/:id" element={<Roadmap />} />
        <Route path="/roadmaps/add" element={<AddRoadMap/>} />
        <Route path="/filter" element={<Filter />} />
      </Routes>
    </Router>
  );
}

export default App;
