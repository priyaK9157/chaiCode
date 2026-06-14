import React, { useEffect, useState } from "react";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById, clearSelectedCourse } from "../store/courseSlice";
import { HiArrowLeft, HiPlus, HiPencil, HiTrash, HiOutlinePlay, HiX } from "react-icons/hi";
import { API_BASE_URL } from "../config";

const InstructorCourseDetails = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedCourse: courseData, loading, error } = useSelector((state) => state.courses);
    const token = useSelector((state) => state.auth.token);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddSection, setShowAddSection] = useState(false);
    const [editForm, setEditForm] = useState({ title: "", description: "", price: "" });
    const [sectionTitle, setSectionTitle] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Add Lesson states
    const [showAddLessonModal, setShowAddLessonModal] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState("");
    const [lessonForm, setLessonForm] = useState({
        title: "",
        duration: "",
        isPreview: false,
        videoSource: "file",
        videoUrl: "",
        videoFile: null
    });

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        if (courseId) {
            dispatch(fetchCourseById(courseId));
        }
        return () => {
            dispatch(clearSelectedCourse());
        };
    }, [courseId, dispatch, token, navigate]);

    // Populate edit form when courseData loads
    useEffect(() => {
        if (courseData) {
            setEditForm({
                title: courseData.title || "",
                description: courseData.description || "",
                price: courseData.price || ""
            });
        }
    }, [courseData]);

    const refreshCourse = () => {
        dispatch(fetchCourseById(courseId));
    };

    // ---- EDIT COURSE ----
    const handleEditCourse = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setShowEditModal(false);
                refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update course");
            }
        } catch (err) {
            alert("Error updating course");
        } finally {
            setActionLoading(false);
        }
    };

    // ---- DELETE COURSE ----
    const handleDeleteCourse = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                navigate("/instructor")
            } else {
                const data = await res.json();
                alert(data.message || "Failed to delete course");
            }
        } catch (err) {
            alert("Error deleting course");
        } finally {
            setActionLoading(false);
        }
    };

    // ---- ADD SECTION ----
    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!sectionTitle.trim()) return;
        setActionLoading(true);
        try {
            const nextOrder = (courseData?.sections?.length || 0) + 1;
            const res = await fetch(`${API_BASE_URL}/api/sections`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId, title: sectionTitle, order: nextOrder }),
            });
            if (res.ok) {
                setSectionTitle("");
                setShowAddSection(false);
                refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to add section");
            }
        } catch (err) {
            alert("Error adding section");
        } finally {
            setActionLoading(false);
        }
    };

    // ---- DELETE SECTION ----
    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm("Are you sure you want to delete this section and all its lessons?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/sections/${sectionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to delete section");
            }
        } catch (err) {
            alert("Error deleting section");
        }
    };

    // ---- ADD LESSON ----
    const handleAddLesson = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append("sectionId", activeSectionId);
            formData.append("title", lessonForm.title);
            formData.append("duration", lessonForm.duration);
            formData.append("isPreview", lessonForm.isPreview);
            
            if (lessonForm.videoSource === "file" && lessonForm.videoFile) {
                formData.append("video", lessonForm.videoFile);
            } else {
                formData.append("videoUrl", lessonForm.videoUrl);
            }

            const currentSection = courseData.sections?.find(s => s.id === activeSectionId);
            const nextOrder = (currentSection?.lessons?.length || 0) + 1;
            formData.append("order", nextOrder);

            const res = await fetch(`${API_BASE_URL}/api/lessons`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (res.ok) {
                setShowAddLessonModal(false);
                setLessonForm({ title: "", duration: "", isPreview: false, videoSource: "file", videoUrl: "", videoFile: null });
                refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to add lesson");
            }
        } catch (err) {
            alert("Error adding lesson");
        } finally {
            setActionLoading(false);
        }
    };

    // ---- DELETE LESSON ----
    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to delete lesson");
            }
        } catch (err) {
            alert("Error deleting lesson");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center text-red-500">
                Error: {error}
            </div>
        );
    }

    if (!courseData) return null;

    return (
        <div className="relative min-h-screen text-white bg-mesh pb-20">
            <BackgroundImage />
            <Navbar />

            <div className="pt-32 px-6 md:px-12 lg:px-28">
                <button 
                    onClick={() => navigate("/instructor")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-semibold uppercase tracking-wider text-sm"
                >
                    <HiArrowLeft />
                    Back to Dashboard
                </button>

                {/* Header Section */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden shadow-2xl">
                    <div className="w-full md:w-[350px] aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-inner flex-shrink-0 border border-white/10">
                        {courseData.thumbnailUrl ? (
                            <img src={courseData.thumbnailUrl} alt={courseData.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-gray-700">
                                {courseData.title.charAt(0)}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between self-stretch">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${courseData.isPublished ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                                    {courseData.isPublished ? "Published" : "Draft"}
                                </span>
                                <span className="px-4 py-1 text-xs font-bold text-gray-300 uppercase tracking-widest bg-white/10 rounded-full border border-white/5">
                                    ₹{courseData.price || 0}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 text-glow leading-tight">{courseData.title}</h1>
                            <p className="text-gray-400 text-lg line-clamp-3">{courseData.description}</p>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                            >
                                <HiPencil /> Edit Details
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-6 py-3 rounded-lg font-bold transition-colors border border-red-500/20"
                            >
                                <HiTrash /> Delete Course
                            </button>
                        </div>
                    </div>
                </div>

                {/* Syllabus / Content Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white">Course Curriculum</h2>
                        <p className="text-gray-400 mt-2">Organize your course into sections and lessons.</p>
                    </div>
                    <button
                        onClick={() => setShowAddSection(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                    >
                        <HiPlus className="text-xl" /> Add Section
                    </button>
                </div>

                <div className="space-y-6">
                    {courseData.sections && courseData.sections.length > 0 ? (
                        courseData.sections.map((section, idx) => (
                            <div key={section.id} className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 bg-gradient-to-r from-neutral-800/50 to-transparent flex justify-between items-center border-b border-neutral-800">
                                    <div className="flex items-center gap-4">
                                        <span className="text-orange-500 font-bold opacity-50">Section {idx + 1}</span>
                                        <h3 className="text-xl font-bold text-white">{section.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setActiveSectionId(section.id);
                                                setShowAddLessonModal(true);
                                            }}
                                            className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center gap-1 mr-4"
                                        >
                                            <HiPlus /> Add Lesson
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSection(section.id)}
                                            className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1"
                                        >
                                            <HiTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    {section.lessons && section.lessons.length > 0 ? (
                                        section.lessons.map((lesson, lIdx) => (
                                            <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                        <HiOutlinePlay />
                                                    </div>
                                                    <span className="text-gray-300 font-medium">
                                                        {lIdx + 1}. {lesson.title}
                                                        {lesson.isPreview && (
                                                            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded uppercase tracking-wider">
                                                                Preview
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLesson(lesson.id);
                                                    }}
                                                    className="text-red-400 hover:text-red-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete Lesson"
                                                >
                                                    <HiTrash className="text-lg" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                            No lessons added to this section yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white/5 backdrop-blur-lg border border-dashed border-white/20 rounded-3xl p-16 text-center shadow-inner">
                            <div className="bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <HiPlus className="text-4xl text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Curriculum is empty</h3>
                            <p className="text-gray-400 max-w-md mx-auto mb-8">
                                Give your course some structure by adding your first section.
                            </p>
                            <button
                                onClick={() => setShowAddSection(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                            >
                                Add First Section
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ====== EDIT COURSE MODAL ====== */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 relative shadow-2xl">
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <HiX className="text-2xl" />
                        </button>
                        <h2 className="text-2xl font-black mb-6">Edit Course Details</h2>
                        <form onSubmit={handleEditCourse} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows="3"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Price (₹)</label>
                                <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                {actionLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ====== DELETE CONFIRM MODAL ====== */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-red-500/30 rounded-3xl w-full max-w-md p-8 text-center shadow-2xl">
                        <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiTrash className="text-3xl text-red-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Delete Course?</h2>
                        <p className="text-gray-400 mb-8">
                            This will permanently delete <strong className="text-white">"{courseData.title}"</strong> and all its sections and lessons. This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCourse}
                                disabled={actionLoading}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                {actionLoading ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== ADD SECTION MODAL ====== */}
            {showAddSection && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
                        <button onClick={() => setShowAddSection(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <HiX className="text-2xl" />
                        </button>
                        <h2 className="text-2xl font-black mb-6">Add New Section</h2>
                        <form onSubmit={handleAddSection} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Section Title</label>
                                <input
                                    type="text"
                                    value={sectionTitle}
                                    onChange={(e) => setSectionTitle(e.target.value)}
                                    placeholder="e.g. Introduction to React"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                {actionLoading ? "Adding..." : "Add Section"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ====== ADD LESSON MODAL ====== */}
            {showAddLessonModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 relative shadow-2xl">
                        <button 
                            onClick={() => {
                                setShowAddLessonModal(false);
                                setLessonForm({ title: "", duration: "", isPreview: false, videoSource: "file", videoUrl: "", videoFile: null });
                            }} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <HiX className="text-2xl" />
                        </button>
                        <h2 className="text-2xl font-black mb-6">Add New Lesson</h2>
                        <form onSubmit={handleAddLesson} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Lesson Title</label>
                                <input
                                    type="text"
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    placeholder="e.g. React Components & Props"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={lessonForm.duration}
                                        onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                        placeholder="e.g. 15"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                        required
                                    />
                                </div>
                                <div className="flex items-center h-full pt-8 pl-2">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={lessonForm.isPreview}
                                            onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                                            className="w-5 h-5 rounded bg-white/5 border border-white/10 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-gray-300">Is Preview Lesson</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Video Source</label>
                                <div className="flex gap-4 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setLessonForm({ ...lessonForm, videoSource: "file" })}
                                        className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${lessonForm.videoSource === "file" ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}
                                    >
                                        Upload Video
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLessonForm({ ...lessonForm, videoSource: "url" })}
                                        className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${lessonForm.videoSource === "url" ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}
                                    >
                                        Video URL
                                    </button>
                                </div>

                                {lessonForm.videoSource === "file" ? (
                                    <div>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setLessonForm({ ...lessonForm, videoFile: e.target.files[0] })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 file:cursor-pointer"
                                            required={!lessonForm.videoFile}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1.5">Supported formats: MP4, MKV, AVI, MOV, WEBM.</p>
                                    </div>
                                ) : (
                                    <input
                                        type="url"
                                        value={lessonForm.videoUrl}
                                        onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                        placeholder="e.g. https://res.cloudinary.com/.../video.mp4"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                        required={lessonForm.videoSource === "url"}
                                    />
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
                            >
                                {actionLoading ? "Uploading & Saving..." : "Add Lesson"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorCourseDetails;
