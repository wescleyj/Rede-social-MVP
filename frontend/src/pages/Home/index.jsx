import "./style.css"
import React from 'react';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from "../../components/RightSidebar/index.jsx";

export default function Home() {
    return (
        <div className="layout-wrapper">
            <LeftSidebar />
            <div className="content">

            </div>
            <RightSidebar />
        </div>
    )
}
