import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay  } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  MdOutlineKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";

const UdemyCourses = () => {
const image = [

    {   src: "https://img-c.udemycdn.com/course/750x422/6515151_7741.jpg",

        title: "Genai with Py"

    },

    {

        src: "https://img-c.udemycdn.com/course/750x422/6629195_fdfd_3.jpg",

        title: "Data Science"

    },

    {

        src: "	https://img-c.udemycdn.com/course/750x422/6514953_e5eb_2.jpg",

        title: "Dsa with Cpp"

    },

    {

        src: "https://img-c.udemycdn.com/course/750x422/6197521_c636.jpg",

        title: "Dsa with Java"

    },

    {

        src: "	https://img-c.udemycdn.com/course/750x422/6864077_85e4.jpg",

        title: "Data Science"

    },

    {

        src: "https://img-c.udemycdn.com/course/750x422/6514953_e5eb_2.jpg",

        title: "Dsa with Cpp"

    }

  ];

  return (
    <div className="flex flex-col gap-5 px-28 py-20">
        <h1 className="text-white text-3xl">Udemy Courses</h1>
        <p className="text-lg text-neutral-400">Learn at your own pace with structured, <span className="text-orange-100 text-lg">high-quality video lessons</span>, designed to give you real-world skills and flexibility.</p>
      {/* Slider Wrapper */}
      <div className=" w-[1000px] mx-auto">
        <Swiper
          modules={[Navigation, Autoplay]} 
          spaceBetween={50}
          slidesPerView={3}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          autoplay={{
          delay: 2500,      // 2.5 seconds between slides
          disableOnInteraction: false, // continues autoplay even after user interaction
        }}
        >
          {image.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="relative transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                <img
                    src={img.src}
                    alt="imgg"
                    className="rounded-2xl w-full object-cover border border-neutral-300 hover:bg-black-400"
                />
                <p className="text-neutral-500 font-semibold text-base w-full p-2">
                    {img.title}
                </p>
              </div>
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

export default UdemyCourses;
