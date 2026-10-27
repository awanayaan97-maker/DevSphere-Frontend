
import { Outlet } from "react-router-dom";

import "./SingleLayout.css";
import Navbar from "../Components/Navbar/Navbar";
import ScrollToTop from "../Components/ScrollToTop/ScrollToTop";

export default function SingleLayout() {
    return (
        <div className="app-layout">
            <ScrollToTop/>
            <Navbar />

            <main className="app-content">
                <Outlet />
            </main>
        </div>
    );
}