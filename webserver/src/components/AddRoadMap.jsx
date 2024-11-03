import React, { useState, useContext } from 'react';
import axios from 'axios';
import './AddRoadMap.css';
// import { UserContext } from '../context/UserContext'; // Adjust this import according to your context setup

const Dashboard = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    //const { user } = useContext(UserContext); // Assuming you have a UserContext providing user info
    const user = { id: '1', name: 'John Doe', email: 'john.doe@example.com' };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!title || !description) {
            setError("Both title and description are required.");
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:3000/api/v1/roadmaps/add',
                {
                    title,
                    description,
                    userId: user.id, 
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzMwNTc2NjM0LCJleHAiOjE3MzkyMTY2MzR9.Uje4ziaDm3cTvRS7Xmm-ho2bF-D_kfT3ZfgLplCu3Bk'
                    }
                }
            );

            setSuccess("Roadmap added successfully!");
            setTitle('');
            setDescription('');
        } catch (error) {
            setError("Failed to add roadmap. Please try again.");
        }
    };

    return (
        <div className="dashboard">
            <h2>Add New Roadmap</h2>
            <form onSubmit={handleSubmit} className="dashboard-form">
                <label>
                    Title:
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Add Roadmap</button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </form>
        </div>
    );
};

export default Dashboard;
