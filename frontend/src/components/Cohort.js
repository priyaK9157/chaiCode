import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  MdOutlineKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCourses } from "../store/courseSlice";

const Cohort = () => {
    const dispatch = useDispatch();
    const { list: courses, loading } = useSelector((state) => state.courses);

    useEffect(() => {
        dispatch(fetchAllCourses());
    }, [dispatch]);

    // Fallback image if course has no thumbnail
    const defaultThumb = "https://chaicode.com/assets/piyush-hitesh-dark-CQ8g4eJE.webp";

  return (
    <div className="flex flex-col gap-5 px-28 py-20">
        <h1 className="text-white text-3xl">Our Cohorts</h1>
        <p className="text-lg text-neutral-400">Learn in engaging <span className="text-orange-100 text-lg">Live classes</span>, collaborate with peers, share ideas, and grow together as part of a vibrant learning community.</p>
      
      {loading && <div className="text-white text-center">Loading courses...</div>}
      
      {/* Slider Wrapper */}
      <div className=" w-[1000px] mx-auto">
        <Swiper
          modules={[Navigation]}
          spaceBetween={50}
          slidesPerView={3}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
        >
          {courses.map((course) => (
            <SwiperSlide key={course.id}>
              <Link to={`/cohort/${course.id}`} className="block relative group overflow-hidden rounded-2xl transform transition-transform duration-300 hover:scale-105 cursor-pointer shadow-xl border border-neutral-800">
                <img
                    src={course.thumbnailUrl || defaultThumb}
                    alt="course-thumb"
                    className="h-[350px] w-full object-cover transition-opacity group-hover:opacity-80"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-8 w-full">
                    <p className="text-white font-bold text-2xl group-hover:text-orange-300 transition-colors uppercase tracking-wide">
                        {course.title}
                    </p>
                    <p className="text-orange-200 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        View Course <MdKeyboardArrowRight size={20} />
                    </p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Buttons */}
      <div className="flex gap-4 text-neutral-500 justify-end">
        <button className="custom-prev border border-gray-800 rounded-full transition-transform duration-300 hover:scale-105 cursor-pointer">
          <MdOutlineKeyboardArrowLeft size={30} />
        </button>
        <button className="custom-next border border-gray-800 rounded-full transition-transform duration-300 hover:scale-105 cursor-pointer">
          <MdKeyboardArrowRight size={30} />
        </button>
      </div>
    </div>
  );
};

export default Cohort;
