
import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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

    const {
        user,
        logout,
        notifications,
        unreadCount,
        setUnreadCount
    } = useContext(AuthContext);

    const { callApi } = useCallApi();
    const API_URL = import.meta.env.VITE_API_URL;

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const notificationRef = useRef(null);


    // Notification API
    useEffect(() => {

        if (!isNotificationOpen) return;

        const notificationTrue = async () => {
            await callApi(
                `${API_URL}/api/user/notification`,
                "PUT",
                [],
                token
            );
        };

        notificationTrue();

    }, [isNotificationOpen]);


    // Close profile dropdown on outside click
    useEffect(() => {

        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);


    // Mobile drawer scroll lock
    useEffect(() => {

        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";

        return () => {
            document.body.style.overflow = "unset";
        };

    }, [isMobileMenuOpen]);


    // Keyboard search shortcut
    useEffect(() => {

        function handleKeyDown(e) {

            if (
                ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") ||
                (
                    e.key === "/" &&
                    document.activeElement.tagName !== "INPUT" &&
                    document.activeElement.tagName !== "TEXTAREA"
                )
            ) {
                e.preventDefault();
                e.stopPropagation();

                inputRef.current?.focus();
            }
        }

        window.addEventListener("keydown", handleKeyDown, true);

        return () => {
            window.removeEventListener("keydown", handleKeyDown, true);
        };

    }, []);


    // Close notification and profile dropdown on outside click
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


    // Logout
    const handleLogoutConfirm = () => {
        logout();

        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        setShowAlert(false);

        navigate("/login");
    };


    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };


    // Avatar
    const renderAvatar = () => {

        if (user) {

            if (
                user.profileImage &&
                user.profileImage.trim() !== ""
            ) {
                return (
                    <img
                        src={user.profileImage}
                        alt="Profile"
                    />
                );
            }

            return (
                <span>
                    {user.firstName
                        ? user.firstName.charAt(0).toUpperCase()
                        : "U"}
                </span>
            );
        }

        return <div className="navbar-avatar-placeholder" />;
    };


    // Search
    function handleSearch() {

        if (!searchInput?.trim()) return;

        navigate(
            `/?q=${encodeURIComponent(searchInput.trim())}&sort=relevance`
        );

        setIsMobileSearchOpen(false);
    }


    // Mobile navigation link
    const closeMenuAndNavigate = () => {
        closeMobileMenu();
        setIsDropdownOpen(false);
    };


    return (
        <header className="navbar">

            {/* Logout Alert */}
            {showAlert && (
                <Alert
                    title="Log Out"
                    message="Are you sure you want to log out of your account?"
                    actionText="Log Out"
                    onAction={handleLogoutConfirm}
                    onClose={() => setShowAlert(false)}
                />
            )}


            {/* Mobile Search */}
            <div
                className={`mobile-search-overlay ${isMobileSearchOpen ? "active" : ""
                    }`}
            >

                <button
                    type="button"
                    className="search-close-btn"
                    onClick={() => setIsMobileSearchOpen(false)}
                    aria-label="Close search"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <div className="mobile-search-input-wrapper">

                    <i
                        className="fa-solid fa-magnifying-glass search-inside-icon"
                        onClick={handleSearch}
                    ></i>

                    <input
                        type="text"
                        placeholder="Search..."
                        autoFocus={isMobileSearchOpen}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
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


            {/* Navbar Left */}
            <div className="navbar-left">

                <button
                    type="button"
                    className="hamburger-btn"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>

                <Logo />

            </div>


            {/* Desktop Search */}
            <div className="navbar-search">

                <i
                    className="fa-solid fa-magnifying-glass search-icon"
                    onClick={handleSearch}
                ></i>

                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search developers, articles..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                />

                <span className="search-shortcut">⌘K</span>

            </div>


            {/* Navbar Actions */}
            <div className="navbar-actions">

                <button
                    type="button"
                    className="icon-btn mobile-search-trigger"
                    onClick={() => setIsMobileSearchOpen(true)}
                    aria-label="Open search"
                >
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>

                <ThemeToggle />


                {token ? (
                    <>

                        {/* Notifications */}
                        <div
                            className="notification-wrapper"
                            ref={notificationRef}
                        >

                            <button
                                type="button"
                                className={`icon-btn notification-button ${isNotificationOpen
                                        ? "notification-button-active"
                                        : ""
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


                        {/* Desktop Profile Dropdown */}
                        <div
                            className="avatar-dropdown-wrapper"
                            ref={dropdownRef}
                        >

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
                                            {user?.firstName}{" "}
                                            {user?.lastName || ""}
                                        </strong>

                                        {/* <span>
                                            @{user?.username || "username"}
                                        </span> */}
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <ul className="dropdown-links">

                                        <li>
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <i className="fa-solid fa-user"></i>
                                                <span>Profile</span>
                                            </Link>
                                        </li>

                                        <li>
                                            <Link
                                                to="/drafts"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <i className="fa-solid fa-file-lines"></i>
                                                <span>My Drafts</span>
                                            </Link>
                                        </li>

                                        <li>
                                            <Link
                                                to="/bookmarks"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <i className="fa-solid fa-bookmark"></i>
                                                <span>My Bookmarks</span>
                                            </Link>
                                        </li>

                                        <li>
                                            <Link
                                                to="/settings"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
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
                                            setShowAlert(true);
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


            {/* Mobile Drawer Overlay */}
            <div
                className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""
                    }`}
                onClick={closeMobileMenu}
            ></div>


            {/* Mobile Drawer */}
            <aside
                className={`mobile-menu-drawer ${isMobileMenuOpen ? "active" : ""
                    }`}
            >

                {/* Drawer Header */}
                <div className="mobile-menu-header">

                    <Link
                        to="/"
                        className="loader-logo"
                        onClick={closeMobileMenu}
                    >
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

                    {/* User Information */}
                    {token && (
                        <div
                            className="mobile-user-profile"
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
                                    {user?.firstName}{" "}
                                    {user?.lastName || ""}
                                </strong>

                                <span>
                                    @{user?.username || "username"}
                                </span>

                            </div>

                        </div>
                    )}


                    <nav className="mobile-nav-links">

                        {/* MENU */}
                        <span className="mobile-menu-label">
                            Menu
                        </span>

                        <NavLink
                            to="/"
                            end
                            onClick={closeMenuAndNavigate}
                        >
                            <i className="fa-solid fa-house"></i>
                            <span>Home</span>
                        </NavLink>

                        <NavLink
                            to="/explore"
                            onClick={closeMenuAndNavigate}
                        >
                            <i className="fa-solid fa-compass"></i>
                            <span>Explore</span>
                        </NavLink>

                        <NavLink
                            to="/community"
                            onClick={closeMenuAndNavigate}
                        >
                            <i className="fa-solid fa-users"></i>
                            <span>Community</span>
                        </NavLink>

                        {token && (
                            <NavLink
                                to="/dashboard"
                                onClick={closeMenuAndNavigate}
                            >
                                <i className="fa-solid fa-chart-line"></i>
                                <span>Dashboard</span>
                            </NavLink>
                        )}


                        {/* CREATE */}
                        {token && (
                            <>
                                <span className="mobile-menu-label">
                                    Create
                                </span>

                                <Link
                                    to="/article-editor"
                                    onClick={closeMenuAndNavigate}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    <span>Create Article</span>
                                </Link>
                            </>
                        )}


                        {/* ACCOUNT */}
                        {token && (
                            <>
                                <span className="mobile-menu-label">
                                    Account
                                </span>

                                <Link
                                    to="/profile"
                                    onClick={closeMenuAndNavigate}
                                >
                                    <i className="fa-solid fa-user"></i>
                                    <span>Profile</span>
                                </Link>

                                <Link
                                    to="/drafts"
                                    onClick={closeMenuAndNavigate}
                                >
                                    <i className="fa-solid fa-file-lines"></i>
                                    <span>My Drafts</span>
                                </Link>

                                <Link
                                    to="/bookmarks"
                                    onClick={closeMenuAndNavigate}
                                >
                                    <i className="fa-solid fa-bookmark"></i>
                                    <span>My Bookmarks</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    onClick={closeMenuAndNavigate}
                                >
                                    <i className="fa-solid fa-gear"></i>
                                    <span>Settings</span>
                                </Link>

                            </>
                        )}

                    </nav>


                    {/* Drawer Footer */}
                    <div className="mobile-menu-footer">

                        {!token ? (

                            <div className="mobile-auth-actions">

                                <Link
                                    to="/signup"
                                    className="btn-join block-btn"
                                    onClick={closeMobileMenu}
                                >
                                    Join Now
                                </Link>

                                <Link
                                    to="/login"
                                    className="btn-login block-btn"
                                    onClick={closeMobileMenu}
                                >
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
