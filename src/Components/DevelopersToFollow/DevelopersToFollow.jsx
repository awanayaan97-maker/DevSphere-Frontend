
import { useNavigate } from "react-router-dom";
import "./DevelopersToFollow.css";

function DevelopersToFollow({ developers, variant = "list", followStates = {}, onFollow }) {

    const navigate = useNavigate();
    if (!developers || developers.length === 0) return null;

    const getInitials = (dev) =>
        `${dev?.firstName?.charAt(0) || ""}${dev?.lastName?.charAt(0) || ""}`;

    const renderFollowButton = (dev) => (
        <button
            type="button"
            className={followStates[dev?._id] ? "follow-btn-following" : "follow-btn"}
            onClick={() => onFollow(dev?._id)}
        >
            {followStates[dev?._id] ? "Following" : "Follow"}
        </button>
    );


    if (variant === "cards") {
        return (
            <div className="developers-cards">

                <div className="mobile-dev-heading">Developers to Follow</div>

                <div className="mobile-dev-list">
                    {developers.map((dev) => (
                        <div className="mobile-dev-card" key={dev._id}>

                            <div
                                className="mobile-dev-avatar"
                                onClick={() => navigate(`/user/${dev._id}`)}
                            >
                                {dev?.profileImage ? (
                                    <img src={dev.profileImage} alt={dev?.firstName} />
                                ) : (
                                    <span>{getInitials(dev)}</span>
                                )}
                            </div>

                            <strong className="mobile-dev-name">
                                {dev?.firstName} {dev?.lastName}
                            </strong>

                            <span className="mobile-dev-role">{dev?.role}</span>

                            {renderFollowButton(dev)}

                        </div>
                    ))}
                </div>

            </div>
        );
    }

    return (
        <div className="sidebar-widget developers-list">

            <div className="sidebar-widget-header">
                <h3>Developers to Follow</h3>
                <span>Discover new people.</span>
            </div>

            <div className="developer-list">
                {developers.map((dev) => (
                    <div className="developer-item" key={dev._id}>

                        <div
                            className="developer-avatar"
                            onClick={() => navigate(`/user/${dev._id}`)}
                        >
                            {dev?.profileImage ? (
                                <img src={dev.profileImage} alt={dev?.firstName} />
                            ) : (
                                <p>{getInitials(dev)}</p>
                            )}
                        </div>

                        <div className="developer-info">
                            <strong>{`${dev?.firstName} ${dev?.lastName}`}</strong>
                            <span>{dev?.role}</span>
                            <span className="developer-followers">
                                {`${dev?.followersCount} followers`}
                            </span>
                        </div>

                        {renderFollowButton(dev)}

                    </div>
                ))}
            </div>

        </div>
    );
}

export default DevelopersToFollow;