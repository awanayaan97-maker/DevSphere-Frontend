

import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Sidebar from "../Components/Sidebar/Sidebar";
import MobileNav from "../Components/MobileNav/MobileNav";
import "./Layout.css";
import ScrollToTop from "../Components/ScrollToTop/ScrollToTop";

function Layout() {
    return (
        <div className="app-layout">

            <ScrollToTop/>

            <Navbar />

            <div className="app-body">

                <Sidebar />

                <main className="page-content">
                    <Outlet />
                </main>

            </div>

            {/* <MobileNav /> */}

        </div>
    );
}

export default Layout;