

import React, { useState, useContext, useEffect, useRef, use } from "react";
import { Link, Links, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import "./Navbar.css";
import { AuthContext } from "../../Context/AuthContext";
import Alert from "../Alert/Alert";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";
import useCallApi from "../../hooks/useCallApi";
import Logo from "../Logo/Logo";
import ThemeToggle from "../ThemeToggle/ThemeToggle";


function Navbar() {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const { user, logout, notifications, unreadCount, setUnreadCount } = useContext(AuthContext);
    const { callApi } = useCallApi();
    const API_URL = import.meta.env.VITE_API_URL;

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const notificationRef = useRef(null);
    const prevLengthRef = useRef(0);

    useEffect(() => {

        if (!isNotificationOpen) return;

        const notificationTrue = async () => {
            const result = await callApi(`${API_URL}/api/user/notification`, "PUT", [], token)
        }

        notificationTrue()

    }, [isNotificationOpen])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {

        function handleKeyDwon(e) {

            if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") ||
                (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {

                e.preventDefault();
                e.stopPropagation();

                if (inputRef.current) {
                    inputRef.current.focus()
                }

            }
        }

        window.addEventListener("keydown", handleKeyDwon, true);

        return () => {
            window.removeEventListener("keydown", handleKeyDwon, true)
        }

    })

    useEffect(() => {
        function handleClickOutside(e) {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setIsNotificationOpen(false);
            }

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);


    const handleLogoutConfirm = () => {
        logout()
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        setShowAlert(false);
        navigate("/login");
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const renderAvatar = () => {
        if (user && user.data) {
            if (user.data.profileImage && user.data.profileImage.trim() !== "") {
                return <img src={user.data.profileImage} alt="Profile" />;
            } else {
                return (
                    <span>
                        {user.data.firstName ? user.data.firstName.charAt(0).toUpperCase() : "U"}
                    </span>
                );
            }
        }
        return <div className="navbar-avatar-placeholder" />;
    };


    function handleSearch() {
        if (!searchInput?.trim()) return null
        navigate(`/?q=${encodeURIComponent(searchInput.trim())}&sort=relevance`);
    }

    return (
        <header className="navbar">

            {showAlert && (
                <Alert
                    title="Log Out"
                    message="Are you sure you want to log out of your account?"
                    actionText="Log Out"
                    onAction={handleLogoutConfirm}
                    onClose={() => setShowAlert(false)}
                />
            )}

            <div className={`mobile-search-overlay ${isMobileSearchOpen ? "active" : ""}`}>
                <button
                    type="button"
                    className="search-close-btn"
                    onClick={() => setIsMobileSearchOpen(false)}
                    aria-label="Close search"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <div className="mobile-search-input-wrapper">
                    <i className="fa-solid fa-magnifying-glass search-inside-icon" onClick={handleSearch}></i>
                    <input
                        type="text"
                        placeholder="Search..."
                        autoFocus={isMobileSearchOpen}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch()
                            }
                        }}
                    />
                </div>

                {token && (
                    <div className="navbar-avatar mobile-search-avatar">
                        {renderAvatar()}
                    </div>
                )}
            </div>

            <div className="navbar-left">
                <button
                    type="button"
                    className="hamburger-btn"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>

                <Logo/>

            </div>

            <div className="navbar-search">
                <i className="fa-solid fa-magnifying-glass search-icon" onClick={handleSearch}></i>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search developers, articles..."
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch()
                        }
                    }}
                />
                <span className="search-shortcut">⌘K</span>
            </div>

            <div className="navbar-actions">
                <button
                    type="button"
                    className="icon-btn mobile-search-trigger"
                    onClick={() => setIsMobileSearchOpen(true)}
                    aria-label="Open search"
                >
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>

                <ThemeToggle/>

                {token ? (
                    <>

                        <div className="notification-wrapper" ref={notificationRef}>
                            <button
                                type="button"
                                className={`icon-btn notification-button ${isNotificationOpen ? "notification-button-active" : ""
                                    }`}
                                aria-label="Notifications"
                                onClick={() => {
                                    setIsNotificationOpen((prev) => {
                                        const nextState = !prev;
                                        if (nextState) {
                                            setUnreadCount(0);
                                        }
                                        return nextState;
                                    });
                                }}
                            >
                                <i className="fa-solid fa-bell"></i>

                                {unreadCount > 0 && (
                                    <span className="notification-badge">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <NotificationDropdown
                                    notifications={notifications}
                                />
                            )}
                        </div>

                        <div className="avatar-dropdown-wrapper" ref={dropdownRef}>
                            <button
                                type="button"
                                className="navbar-avatar-btn"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                aria-label="User menu"
                            >
                                <div className="navbar-avatar">
                                    {renderAvatar()}
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className="profile-dropdown-menu">
                                    <div className="dropdown-user-header">
                                        <strong>
                                            {user?.data?.firstName} {user?.data?.lastName || ""}
                                        </strong>
                                        <span>@{user?.data?.username || "username"}</span>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <ul className="dropdown-links">
                                        <li>
                                            <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                                                <i className="fa-solid fa-user"></i>
                                                <span>Profile</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/drafts" onClick={() => setIsDropdownOpen(false)}>
                                                <i className="fa-solid fa-file-lines"></i>
                                                <span>My Drafts</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/bookmarks" onClick={() => setIsDropdownOpen(false)}>
                                                <i className="fa-solid fa-bookmark"></i>
                                                <span>My Bookmarks</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/settings" onClick={() => setIsDropdownOpen(false)}>
                                                <i className="fa-solid fa-gear"></i>
                                                <span>Settings</span>
                                            </Link>
                                        </li>
                                    </ul>

                                    <div className="dropdown-divider"></div>

                                    <button
                                        type="button"
                                        className="dropdown-logout-btn"
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setShowAlert(true); // Trigger Logout Alert
                                        }}
                                    >
                                        <i className="fa-solid fa-right-from-bracket"></i>
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="auth-buttons desktop-only-auth">
                        <Link to="/login" className="btn-login">
                            Log In
                        </Link>
                        <Link to="/signup" className="btn-join">
                            Join Now
                        </Link>
                    </div>
                )}
            </div>

            <div
                className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
                onClick={closeMobileMenu}
            ></div>

            <aside className={`mobile-menu-drawer ${isMobileMenuOpen ? "active" : ""}`}>
                <div className="mobile-menu-header">
                    <Link to="/" className="loader-logo" onClick={closeMobileMenu}>
                        <span className="logo-bracket">&lt;</span>
                        <span className="logo-name">DevSphere</span>
                        <span className="logo-bracket">/&gt;</span>
                    </Link>
                    <button
                        type="button"
                        className="mobile-menu-close"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="mobile-menu-content">
                    {token && (
                        <div
                            className="mobile-user-profile"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                closeMobileMenu();
                                navigate("/profile");
                            }}
                        >
                            <div className="navbar-avatar">
                                {renderAvatar()}
                            </div>
                            <div className="mobile-user-info">
                                <strong>
                                    {user?.data?.firstName} {user?.data?.lastName || ""}
                                </strong>
                                <span>@{user?.data?.username || "username"}</span>
                            </div>
                        </div>
                    )}

                    <nav className="mobile-nav-links">
                        <span className="mobile-menu-label">Menu</span>
                        <Link to="/" onClick={closeMobileMenu}>
                            <i className="fa-solid fa-house"></i>
                            <span>Home</span>
                        </Link>
                        <Link to="/articles" onClick={closeMobileMenu}>
                            <i className="fa-solid fa-newspaper"></i>
                            <span>Articles</span>
                        </Link>
                        <Link to="/community" onClick={closeMobileMenu}>
                            <i className="fa-solid fa-users"></i>
                            <span>Community</span>
                        </Link>

                        {token && (
                            <>
                                <span className="mobile-menu-label">Dashboard</span>
                                <Link to="/profile" onClick={closeMobileMenu}>
                                    <i className="fa-solid fa-user"></i>
                                    <span>Profile</span>
                                </Link>
                                <Link to="/drafts" onClick={closeMobileMenu}>
                                    <i className="fa-solid fa-file-lines"></i>
                                    <span>My Drafts</span>
                                </Link>
                                <Link to="/settings" onClick={closeMobileMenu}>
                                    <i className="fa-solid fa-gear"></i>
                                    <span>Settings</span>
                                </Link>
                            </>
                        )}
                    </nav>

                    <div className="mobile-menu-footer">
                        {!token ? (
                            <div className="mobile-auth-actions">
                                <Link to="/register" className="btn-join block-btn" onClick={closeMobileMenu}>
                                    Join Now
                                </Link>
                                <Link to="/login" className="btn-login block-btn" onClick={closeMobileMenu}>
                                    Log In
                                </Link>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="dropdown-logout-btn mobile-logout-btn"
                                onClick={() => {
                                    closeMobileMenu();
                                    setShowAlert(true);
                                }}
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Log Out</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </header>
    );
}


export default Navbar;
