import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AddButton.css';

const AddButton = () => {
    const navigate = useNavigate();

    const redirectToAddRoad = () => {
        navigate('/roadmaps/add');
    };

    return (
        <button className="add-button" onClick={redirectToAddRoad}>
            +
        </button>
    );
};

export default AddButton;
