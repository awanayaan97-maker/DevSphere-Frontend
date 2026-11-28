


import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import "./Connections.css";

import useApiQuery from "../../hooks/useApiQuery";
import useLoginChecker from "../../hooks/useLoginChecker";
import Alert from "../../Components/Alert/Alert";
import ResponsePopup from "../../Components/ResponsePopup/ResponsePopup";
import { AuthContext } from "../../Context/AuthContext";
import SectionLoader from "../../Components/SectionLoader/SectionLoader";

const VALID_TABS = ["followers", "followings"];

function isValidTab(value) {
  return VALID_TABS.includes(value);
}

function Connections() {
  const { type } = useParams();
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_API_URL;
  const { isLoggedIn } = useLoginChecker();

  const [activeTab, setActiveTab] = useState(
    isValidTab(type) ? type : "followers"
  );

  useEffect(() => {
    if (isValidTab(type) && type !== activeTab) {
      setActiveTab(type);
    }
  }, [type, activeTab]);

  const queryKey = ["connections", activeTab, user?._id];

  const { isLoading, error, setError, data } = useApiQuery({
    url: `${API_URL}/api/user/connections/${activeTab}`,
    type: "GET",
    isAuthorized: true,
    enabled: isValidTab(type) && isLoggedIn,
    queryKey,
  });

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    navigate(`/connections/${nextTab}`, { replace: true });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["connections"],
    });
  };

  const openProfile = (userId) => {
    if (userId) {
      navigate(`/user/${userId}`);
    }
  };

  if (!isValidTab(type)) {
    return (
      <main className="connections-page">
        <div className="connections-container">
          <section className="connections-empty connections-invalid">
            <div className="connections-empty-icon">
              <i className="fa-solid fa-link-slash"></i>
            </div>

            <span className="connections-eyebrow">PAGE NOT FOUND</span>
            <h2>Invalid Connection Type</h2>
            <p>
              The connections view you're looking for doesn't exist.
              Choose a valid connections page to continue.
            </p>

            <div className="connections-empty-actions">
              <button
                type="button"
                className="connections-btn-primary"
                onClick={() => handleTabChange("followers")}
              >
                View Followers
                <i className="fa-solid fa-arrow-right"></i>
              </button>

              <button
                type="button"
                className="connections-btn-secondary"
                onClick={() => navigate("/profile")}
              >
                Back to Profile
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <Alert
        title="Login Required"
        message="Please login or create an account to view your connections."
        actionText="Login Now"
        onAction={() => navigate("/login")}
        onClose={() => navigate("/")}
      />
    );
  }

  if (isLoading) {
    return <SectionLoader />;
  }

  const list = Array.isArray(data) ? data : [];

  const isFollowers = activeTab === "followers";

  return (
    <main className="connections-page">
      <div className="connections-container">
        {error ? (
          <ResponsePopup
            message={error}
            closePopup={() => setError(null)}
          />
        ) : null}

        {/* Page Header */}
        <header className="connections-header">
          <div className="connections-topbar">
            <button
              type="button"
              className="connections-back-btn"
              onClick={() => navigate("/profile")}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back to Profile</span>
            </button>

            <button
              type="button"
              className="connections-refresh-btn"
              onClick={handleRefresh}
              aria-label="Refresh connections"
              title="Refresh connections"
            >
              <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>

          <div className="connections-heading">
            <div className="connections-heading-content">
              <span className="connections-eyebrow">
                YOUR DEVELOPER NETWORK
              </span>

              <h1>Connections<span>.</span></h1>

              <p className="connections-subtitle">
                The people you're connected with on DevSphere.
              </p>
            </div>

            <div className="connections-heading-icon" aria-hidden="true">
              <i className="fa-solid fa-users"></i>
              <span className="connections-icon-dot"></span>
            </div>
          </div>

          {/* Active Tab Summary */}
          <div className="connections-summary">
            <div className="connections-summary-icon">
              <i
                className={`fa-solid ${isFollowers ? "fa-user-group" : "fa-user-plus"
                  }`}
              ></i>
            </div>

            <div className="connections-summary-text">
              <span className="connections-summary-label">
                {isFollowers ? "Your followers" : "You're following"}
              </span>

              <strong>
                {list.length}{" "}
                {list.length === 1 ? "person" : "people"}
              </strong>
            </div>

            <span className="connections-summary-status">
              <span></span>
              {isFollowers ? "Followers" : "Following"}
            </span>
          </div>

          {/* Tabs */}
          <div
            className="connections-tabs"
            role="tablist"
            aria-label="Connection types"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isFollowers}
              className={`connections-tab ${isFollowers ? "is-active" : ""
                }`}
              onClick={() => handleTabChange("followers")}
            >
              <i className="fa-solid fa-users"></i>
              <span>Followers</span>

              {isFollowers && (
                <span className="connections-tab-count">
                  {list.length}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={!isFollowers}
              className={`connections-tab ${!isFollowers ? "is-active" : ""
                }`}
              onClick={() => handleTabChange("followings")}
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Following</span>

              {!isFollowers && (
                <span className="connections-tab-count">
                  {list.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Connections List */}
        <section className="connections-content">
          <div className="connections-section-heading">
            <div>
              <h2>
                {isFollowers ? "People following you" : "People you follow"}
              </h2>

              <p>
                {isFollowers
                  ? "Developers who are part of your network."
                  : "Developers and creators you've connected with."}
              </p>
            </div>

            <span className="connections-result-count">
              {list.length} {list.length === 1 ? "result" : "results"}
            </span>
          </div>

          {list.length > 0 ? (
            <ul className="connections-list">
              {list.map((item) => {
                const profile =
                  item?.followersData || item?.followingsData;

                const targetId = profile?._id;

                const fullName =
                  [profile?.firstName, profile?.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() || "Developer";

                const initial =
                  profile?.firstName?.charAt(0)?.toUpperCase() || "D";

                const handle =
                  profile?.username ||
                  profile?.firstName?.toLowerCase().replace(/\s+/g, "") ||
                  "member";

                const subtitleText =
                  profile?.role ||
                  profile?.headline ||
                  "DevSphere Member";

                return (
                  <li
                    className="connection-row"
                    key={item._id || targetId}
                  >
                    <button
                      type="button"
                      className="connection-user-info"
                      onClick={() => openProfile(targetId)}
                      disabled={!targetId}
                      aria-label={`View ${fullName}'s profile`}
                    >
                      <div className="connection-avatar-wrap">
                        {profile?.profileImage ? (
                          <img
                            src={profile.profileImage}
                            alt=""
                            className="connection-avatar"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="connection-avatar-fallback"
                            aria-hidden="true"
                          >
                            {initial}
                          </div>
                        )}

                        <span className="connection-avatar-indicator"></span>
                      </div>

                      <div className="connection-meta">
                        <div className="connection-name-line">
                          <h3 className="connection-name">
                            {fullName}
                          </h3>

                          <span className="connection-handle">
                            @{handle}
                          </span>
                        </div>

                        <p className="connection-role">
                          {subtitleText}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="connection-profile-btn"
                      disabled={!targetId}
                      onClick={() => openProfile(targetId)}
                    >
                      <span>View Profile</span>
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <section className="connections-empty" aria-live="polite">
              <div className="connections-empty-art">
                <div className="connections-empty-icon">
                  <i className="fa-solid fa-user-group"></i>
                </div>

                <span className="connections-empty-orbit orbit-one"></span>
                <span className="connections-empty-orbit orbit-two"></span>
              </div>

              <span className="connections-eyebrow">
                YOUR NETWORK STARTS HERE
              </span>

              <h2>
                {isFollowers
                  ? "No followers yet"
                  : "Not following anyone yet"}
              </h2>

              <p>
                {isFollowers
                  ? "When developers follow your profile, they'll appear here. Keep sharing your work and growing your presence."
                  : "Discover developers, explore their work, and connect with people who share your interests."}
              </p>

              <div className="connections-empty-actions">
                <button
                  type="button"
                  className="connections-btn-primary"
                  onClick={() => navigate("/explore")}
                >
                  <i className="fa-solid fa-compass"></i>
                  <span>Explore Developers</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

export default Connections;
