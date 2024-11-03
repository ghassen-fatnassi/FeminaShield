import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="ontainer">
    <div className="home-container">
      <h1 className="home-title">Welcome! Choose a Section</h1>
      <p className="home-subtitle">Select one of the options below to explore the extension:</p>
      <div className="button-container">
        <button onClick={() => navigate('/heatmap')} className="home-button heatmap-button">
          HeatMap
        </button>
        <button onClick={() => navigate('/roadmaps')} className="home-button roadmaps-button">
          Roadmaps
        </button>
        <button onClick={() => navigate('/filter')} className="home-button filter-button">
          Filter
        </button>
      </div>
    </div>
    </div>
  );
};

export default Home;
