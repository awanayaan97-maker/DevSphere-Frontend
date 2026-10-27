
import "./NoResults.css"

function NoResults({
    title = "No results found",
    message = "We couldn't find anything matching your search.",
    icon = "fa-solid fa-magnifying-glass"
}) {
    return (
        <div className="no-results">
            
            <div className="no-results-icon">
                <i className={icon}></i>
            </div>

            <div className="no-results-content">
                <h3>{title}</h3>

                <p>{message}</p>
            </div>

        </div>
    );
}

export default NoResults;