
import "./ProfileLayout.css"

import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar/Sidebar";
import MobileNav from "../Components/MobileNav/MobileNav";
import ScrollToTop from "../Components/ScrollToTop/ScrollToTop";

function ProfileLayout() {
    return (
        <div className="profile-layout">
            <ScrollToTop/>

            <Sidebar />

            <main className="profile-main-content">
                <Outlet />
            </main>

            <MobileNav/>

        </div>
    );
}

export default ProfileLayout;