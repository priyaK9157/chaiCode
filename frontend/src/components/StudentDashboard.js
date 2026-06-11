import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineBookOpen, HiAcademicCap } from "react-icons/hi";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../config";

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchEnrolledCourses = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/courses/enrolled`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error("Error fetching enrolled courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, [token, navigate]);

    return (
        <div className="relative min-h-screen text-white">
            <BackgroundImage />
            <Navbar />

            <div className="pt-32 px-6 md:px-12 lg:px-28">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent uppercase tracking-tight">
                            Student Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Welcome back, {user?.name || "Learner"}! Access your enrolled cohorts and courses here.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div 
                                key={course.id}
                                className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-3xl hover:border-orange-500/50 transition-all group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-4 overflow-hidden relative border border-white/5">
                                        {course.thumbnailUrl ? (
                                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-black text-5xl">
                                                {course.title.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 text-orange-400">
                                            Enrolled
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 font-light leading-relaxed">
                                        {course.description || "No description provided."}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                                    <span className="text-xs text-neutral-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                        <HiOutlineBookOpen className="text-orange-400 text-base" /> Course Access
                                    </span>
                                    <Link 
                                        to={`/course/${course.id}/learn`}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-950/20 hover:scale-105"
                                    >
                                        Start Learning
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 backdrop-blur-lg border border-dashed border-white/20 rounded-[2.5rem] p-20 text-center">
                        <div className="bg-orange-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
                            <HiAcademicCap className="text-4xl text-orange-500 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No active courses</h2>
                        <p className="text-gray-400 mb-8 max-w-sm mx-auto font-light leading-relaxed">
                            You haven't purchased or enrolled in any courses yet. Expand your developer toolkit today!
                        </p>
                        <Link 
                            to="/cohorts"
                            className="bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-gray-200 transition-all shadow-xl hover:scale-105 inline-block"
                        >
                            Explore Cohorts
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
