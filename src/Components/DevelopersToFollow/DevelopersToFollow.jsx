

import { useNavigate } from "react-router-dom";
import { useFollowToggle } from "../../hooks/useFollowToggle";
import "./DevelopersToFollow.css"

function MobileDevCard({ dev, navigate }) {
    const getInitials = (d) => `${d?.firstName?.charAt(0) || ""}${d?.lastName?.charAt(0) || ""}`;
    
    const { isFollowing, toggleFollow, showFollowAlert, setShowFollowAlert } = useFollowToggle({
        userId: dev._id,
        initialIsFollowing: dev.isFollowing
    });

    return (
        <div className="mobile-dev-card">
            <div className="mobile-dev-avatar" onClick={() => navigate(`/user/${dev._id}`)}>
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

            <button
                type="button"
                className={isFollowing ? "follow-btn-following" : "follow-btn"}
                onClick={toggleFollow}
            >
                {isFollowing ? "Following" : "Follow"}
            </button>

            {showFollowAlert && (
                <Alert title="Login Required" message="Please login to follow" onClose={() => setShowFollowAlert(false)} />
            )}
        </div>
    );
}

function SidebarDevItem({ dev, navigate }) {
    const getInitials = (d) => `${d?.firstName?.charAt(0) || ""}${d?.lastName?.charAt(0) || ""}`;

    const { isFollowing, toggleFollow, showFollowAlert, setShowFollowAlert } = useFollowToggle({
        userId: dev._id,
        initialIsFollowing: dev.isFollowing
    });

    return (
        <div className="developer-item">
            <div className="developer-avatar" onClick={() => navigate(`/user/${dev._id}`)}>
                {dev?.profileImage ? (
                    <img src={dev.profileImage} alt={dev?.firstName} />
                ) : (
                    <p>{getInitials(dev)}</p>
                )}
            </div>

            <div className="developer-info">
                <strong>{`${dev?.firstName} ${dev?.lastName}`}</strong>
                <span>{dev?.role}</span>
                <span className="developer-followers">{`${dev?.followersCount} followers`}</span>
            </div>

            <button
                type="button"
                className={isFollowing ? "follow-btn-following" : "follow-btn"}
                onClick={toggleFollow}
            >
                {isFollowing ? "Following" : "Follow"}
            </button>

            {showFollowAlert && (
                <Alert title="Login Required" message="Please login to follow" onClose={() => setShowFollowAlert(false)} />
            )}
        </div>
    );
}

function DevelopersToFollow({ developers, variant = "list" }) {

    console.log("Developers data on desktop:", developers);
    const navigate = useNavigate();
    if (!developers || developers.length === 0) return null;

    if (variant === "cards") {
        return (
            <div className="developers-cards">
                <div className="mobile-dev-heading">Developers to Follow</div>
                <div className="mobile-dev-list">
                    {developers.map((dev) => (
                        <MobileDevCard key={dev._id} dev={dev} navigate={navigate} />
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
                    <SidebarDevItem key={dev._id} dev={dev} navigate={navigate} />
                ))}
            </div>
        </div>
    );
}

export default DevelopersToFollow