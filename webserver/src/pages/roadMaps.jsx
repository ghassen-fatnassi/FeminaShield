import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './roadMaps.css';
import AddButton from '../components/AddButton.jsx';
const RoadMaps = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');

  const fetchRoadmaps = async (searchQuery) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/roadmaps?q=${searchQuery}`, {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzMwNTc2NjM0LCJleHAiOjE3MzkyMTY2MzR9.Uje4ziaDm3cTvRS7Xmm-ho2bF-D_kfT3ZfgLplCu3Bk'
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    }
  };

  useEffect(() => {
    const queryParam = new URLSearchParams(location.search).get('q');
    if (queryParam && queryParam !== query) {
      setQuery(queryParam);
      fetchRoadmaps(queryParam);
    }
  }, [location.search]);

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/roadmaps?q=${query}`);
    fetchRoadmaps(query);
  };

  return (
    <div className="container">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for roadmaps"
        />
        <button type="submit">Search</button>
      </form>
      <AddButton/>

      {results.length > 0 && (
        <div className="results">
          <h2>Results:</h2>
          {results.map((roadmap) => (
            <div key={roadmap.id} className="result-card">
              <h1
                className="clickable-title"
                onClick={() => navigate(`/roadmaps/${roadmap.id}`)} // Link to /roadmaps/{id}
              >
                {roadmap.title}
              </h1>
              <p>Created by: {roadmap.User ? roadmap.User.username : 'Unknown User'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadMaps;
