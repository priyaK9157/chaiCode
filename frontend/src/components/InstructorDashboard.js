import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { Link } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import { useSelector } from "react-redux";

const InstructorDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        // Mocking a logged-in instructor for demonstration
        // In a real app, this would come from an AuthContext/Token
        const fetchInstructorCourses = async () => {
            try {
                const response = await fetch("https://chaicode-1.onrender.com/api/courses/instructor", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error("Error fetching instructor courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorCourses();
    }, [token]);

    return (
        <div className="relative min-h-screen text-white">
            <BackgroundImage />
            <Navbar />

            <div className="pt-32 px-8 lg:px-28">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                            Instructor Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your cohorts and learning content</p>
                    </div>
                    <Link 
                        to="/instructor/add-course"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/20"
                    >
                        <HiPlus className="text-xl" />
                        Create New Course
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div 
                                key={course.id}
                                className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-all group"
                            >
                                <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 overflow-hidden relative">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-bold text-4xl">
                                            {course.title.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                        {course.isPublished ? "Published" : "Draft"}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                                    {course.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {course.description || "No description provided."}
                                </p>
                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="text-orange-400 font-bold">₹{course.price || 0}</span>
                                    <Link 
                                        to={`/instructor/course/${course.id}`}
                                        className="text-sm text-blue-400 hover:underline"
                                    >
                                        Manage Course →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 backdrop-blur-lg border border-dashed border-white/20 rounded-3xl p-20 text-center">
                        <div className="bg-blue-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiPlus className="text-4xl text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No courses yet</h2>
                        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                            You haven't created any courses yet. Start sharing your knowledge with the community!
                        </p>
                        <Link 
                            to="/instructor/add-course"
                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorDashboard;
