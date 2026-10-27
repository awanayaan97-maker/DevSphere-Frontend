

import { useContext } from "react";

import { ThemeContext } from "../../Context/ThemeContext";

import "./ThemeToggle.css";

function ThemeToggle() {
    const { theme, handleTheme } = useContext(ThemeContext);

    return (
        <button
            type="button"
            className="icon-btn theme-button"
            onClick={handleTheme}
            aria-label="Toggle theme"
        >
            {theme === "light" ? (
                <i className="fa-solid fa-sun"></i>
            ) : (
                <i className="fa-solid fa-moon"></i>
            )}
        </button>
    );
}

export default ThemeToggle;