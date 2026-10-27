

import "./ArticlesEndMessage.css";

function ArticlesEndMessage() {
    return (
        <div className="articles-end-message">

            <div className="articles-end-icon">
                <i className="fa-solid fa-check"></i>
            </div>

            <div className="articles-end-content">

                <strong>
                    You’re all caught up
                </strong>

                <span>
                    You’ve reached the end of the latest articles.
                </span>

            </div>

            <i className="fa-solid fa-angles-down articles-end-arrow"></i>

        </div>
    );
}

export default ArticlesEndMessage;