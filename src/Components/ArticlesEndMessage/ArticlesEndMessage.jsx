

import "./ArticlesEndMessage.css";

function ArticlesEndMessage({message}) {
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
                    {message}
                </span>

            </div>

        </div>
    );
}

export default ArticlesEndMessage;