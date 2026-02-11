import React from 'react';

const ImpactBanner = ({ type, message }) => {
    return (
        <div className={`impact-banner ${type}`}>
            {message}
        </div>
    );
};

export default ImpactBanner;
