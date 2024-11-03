import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './roadMap.css';

const Roadmap = () => {
  const { id } = useParams(); 
  const [roadmap, setRoadmap] = useState(null);

  const fetchRoadmapById = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/roadmaps/${id}`, {
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
      setRoadmap(data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoadmapById();
    }
  }, [id]);

  return (
    <div className="roadmap-container">
      {roadmap ? (
        <div className="roadmap-details">
          <h1>{roadmap.title}</h1>
          <p>{roadmap.description}</p>
          <p>Created by: {roadmap.User ? roadmap.User.username : 'Unknown User'}</p>
        </div>
      ) : (
        <p>Loading roadmap details...</p>
      )}
    </div>
  );
};

export default Roadmap;
