import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { useSelector } from "react-redux";

const AddCourse = () => {
    const navigate = useNavigate();
    const token = useSelector(state => state.auth.token);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: ""
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setThumbnail(files[0]);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("price", parseFloat(formData.price) || 0);
            data.append("isPublished", "true");
            if (thumbnail) {
                data.append("thumbnail", thumbnail);
            }

            const response = await fetch("http://localhost:5000/api/courses", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: data
            });

            if (response.ok) {
                alert("Course created successfully!");
                navigate("/instructor");
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || "Failed to create course"}`);
            }
        } catch (error) {
            console.error("Error creating course:", error);
            alert("An error occurred while creating the course.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen text-white">
            <BackgroundImage />
            <Navbar />

            <div className="pt-32 px-8 lg:px-28 pb-20">
                <button 
                    onClick={() => navigate("/instructor")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <HiArrowLeft />
                    Back to Dashboard
                </button>

                <div className="max-w-3xl">
                    <h1 className="text-4xl font-bold mb-2">Create New Course</h1>
                    <p className="text-gray-400 mb-12">Fill in the details below to launch your new cohort</p>

                    <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Course Title</label>
                                <input 
                                    required
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Full Stack Web Development"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Price (₹)</label>
                                <input 
                                    required
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="e.g. 4999"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                            <textarea 
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="What will students learn in this course?"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider block">Course Thumbnail</label>
                            <input 
                                type="file"
                                name="thumbnail"
                                accept="image/*"
                                onChange={handleChange}
                                className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700 transition-all cursor-pointer"
                            />
                            {thumbnail && (
                                <p className="text-xs text-blue-400">Selected: {thumbnail.name}</p>
                            )}
                        </div>

                        <div className="pt-6">
                            <button 
                                type="submit"
                                disabled={submitting}
                                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                        Creating Course...
                                    </>
                                ) : "Launch Course"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCourse;
