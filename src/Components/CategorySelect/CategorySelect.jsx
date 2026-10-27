import React from "react";
import "./CategorySelect.css";

const CategorySelect = ({ 
    selectedCategory, 
    onChange, 
    label,
    size = "default" 
}) => {
    const currentSize = size || "default";

    const selectClassName = currentSize === "sm" 
        ? "explore-filter-select explore-filter-select-sm" 
        : "explore-filter-select";

    return (
        <div className="category-select-wrapper">
            {label && <label className="category-select-label">{label}</label>}
            <select
                className={selectClassName}
                value={selectedCategory}
                onChange={onChange}
            >
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="DevOps / Cloud">DevOps / Cloud</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Data Science">Data Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="System Design">System Design</option>
                <option value="Databases">Databases</option>
                <option value="Open Source">Open Source</option>
                <option value="Blockchain / Web3">Blockchain / Web3</option>
                <option value="Career & Productivity">Career & Productivity</option>
                <option value="Other">Other</option>
            </select>
        </div>
    );
};

export default CategorySelect;