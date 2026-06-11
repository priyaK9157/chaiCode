import React from "react";
import { useSelector } from "react-redux";
import InstructorDashboard from "./InstructorDashboard";
import StudentDashboard from "./StudentDashboard";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role === "INSTRUCTOR") {
        return <InstructorDashboard />;
    }

    return <StudentDashboard />;
};

export default Dashboard;
