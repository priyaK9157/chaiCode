import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiArrowLeft, HiLockClosed, HiOutlinePlay, HiFolder, HiVideoCamera, HiAcademicCap } from "react-icons/hi";
import { API_BASE_URL } from "../config";

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);

    const [course, setCourse] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [lessonDetail, setLessonDetail] = useState(null);
    const [loadingLesson, setLoadingLesson] = useState(false);
    const [lessonError, setLessonError] = useState(null);

    // Fetch Course Structure publicly
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchCourseData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCourse(data);
                    // Select first lesson by default if available
                    if (data?.sections?.length > 0 && data.sections[0].lessons?.length > 0) {
                        setActiveLesson(data.sections[0].lessons[0]);
                    }
                } else {
                    console.error("Failed to fetch course details");
                }
            } catch (err) {
                console.error("Error fetching course:", err);
            } finally {
                setLoadingCourse(false);
            }
        };

        fetchCourseData();
    }, [courseId, token, navigate]);

    // Fetch Active Lesson Details (Authenticated with Video URL verification)
    useEffect(() => {
        if (!activeLesson || !token) return;

        const fetchLessonDetails = async () => {
            setLoadingLesson(true);
            setLessonError(null);
            setLessonDetail(null);

            try {
                const response = await fetch(`${API_BASE_URL}/api/lessons/${activeLesson.id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLessonDetail(data);
                } else {
                    const errorData = await response.json();
                    setLessonError(errorData.message || "Failed to load lesson video.");
                }
            } catch (err) {
                console.error("Error fetching lesson:", err);
                setLessonError("Network error. Failed to retrieve video.");
            } finally {
                setLoadingLesson(false);
            }
        };

        fetchLessonDetails();
    }, [activeLesson, token]);

    // Helper to render video player based on URL type
    const renderVideoPlayer = (url) => {
        if (!url) return <div className="text-gray-400">No video URL available for this lesson.</div>;

        // Check if YouTube link
        const isYoutube = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("youtube-nocookie.com");
        
        if (isYoutube) {
            let embedUrl = url;
            if (url.includes("watch?v=")) {
                const videoId = url.split("v=")[1]?.split("&")[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (url.includes("youtu.be/")) {
                const videoId = url.split("youtu.be/")[1]?.split("?")[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }

            return (
                <iframe
                    src={embedUrl}
                    title={lessonDetail?.title || "Lesson Video"}
                    className="w-full h-full rounded-2xl border border-white/10 shadow-2xl"
                    allowFullScreen
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                ></iframe>
            );
        }

        // Default HTML5 video player for direct links (e.g. mp4, Cloudinary, etc.)
        return (
            <video
                src={url}
                controls
                controlsList="nodownload"
                className="w-full h-full rounded-2xl border border-white/10 shadow-2xl bg-black object-contain"
            ></video>
        );
    };

    if (loadingCourse) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white pt-20">
                <h2 className="text-2xl font-bold mb-4">Course not found</h2>
                <Link to="/dashboard" className="text-orange-500 hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen text-white pb-10">
            <BackgroundImage />
            <Navbar />

            <div className="pt-32 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
                {/* Back Link */}
                <Link 
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-bold uppercase tracking-wider text-xs"
                >
                    <HiArrowLeft />
                    Back to Dashboard
                </Link>

                {/* Main Player Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left/Main Column: Video Player & Info */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Video Frame */}
                        <div className="aspect-video bg-neutral-950 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center shadow-glow-sm">
                            {loadingLesson ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                    <p className="text-gray-500 text-sm">Loading learning content...</p>
                                </div>
                            ) : lessonError ? (
                                <div className="p-8 text-center flex flex-col items-center gap-4 max-w-md">
                                    <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 text-red-500">
                                        <HiLockClosed className="text-4xl" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-400">Content Locked</h3>
                                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                                        {lessonError}
                                    </p>
                                    <Link 
                                        to={`/cohort/${courseId}`}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold mt-2 transition-all shadow-md shadow-orange-950/25"
                                    >
                                        View Enrollment Options
                                    </Link>
                                </div>
                            ) : lessonDetail ? (
                                renderVideoPlayer(lessonDetail.videoUrl)
                            ) : (
                                <div className="text-center text-gray-500">
                                    <HiVideoCamera className="text-5xl mx-auto mb-3 opacity-30" />
                                    Select a lesson from the syllabus to start learning.
                                </div>
                            )}
                        </div>

                        {/* Lesson Info */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8">
                            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                                {activeLesson?.title || "Welcome"}
                            </h2>
                            {lessonDetail?.duration && (
                                <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-neutral-300 uppercase tracking-widest mt-3 border border-white/5">
                                    Duration: {lessonDetail.duration} mins
                                </span>
                            )}
                            <div className="h-px bg-white/10 my-6"></div>
                            <div>
                                <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">About this Course</h4>
                                <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                                <p className="text-gray-400 text-sm font-light leading-relaxed">{course.description}</p>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Playlist / Curriculum Sidebar */}
                    <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[fit-content] max-h-[80vh] overflow-y-auto flex flex-col gap-6">
                        <div>
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <HiAcademicCap className="text-orange-500 text-2xl" /> Course Curriculum
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Syllabus structure</p>
                        </div>

                        <div className="flex flex-col gap-6">
                            {course.sections?.map((section, idx) => (
                                <div key={section.id} className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                                        <HiFolder className="text-neutral-500 flex-shrink-0 text-lg" />
                                        <span className="text-sm font-black text-neutral-300 line-clamp-1">
                                            S{idx + 1}: {section.title}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 pl-3">
                                        {section.lessons?.map((lesson, lIdx) => {
                                            const isActive = activeLesson?.id === lesson.id;
                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setActiveLesson(lesson)}
                                                    className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3 transition-all ${
                                                        isActive 
                                                            ? "bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold" 
                                                            : "bg-white/5 border border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    <HiOutlinePlay className={`text-lg flex-shrink-0 mt-0.5 ${isActive ? "text-orange-400" : "text-neutral-500"}`} />
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm leading-snug line-clamp-2">
                                                            {lIdx + 1}. {lesson.title}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
