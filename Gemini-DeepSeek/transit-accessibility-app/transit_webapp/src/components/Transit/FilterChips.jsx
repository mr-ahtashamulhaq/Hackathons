import React, { useState } from 'react';

const FilterChips = () => {
    const [activeFilter, setActiveFilter] = useState('depart-now');

    const filters = [
        { id: 'depart-now', label: 'Depart Now' },
        { id: 'lowest-co2', label: 'Lowest CO₂' },
        { id: 'accessible', label: 'Accessible' }
    ];

    return (
        <div className="filter-chips">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    className={`chip ${activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter.id)}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default FilterChips;
