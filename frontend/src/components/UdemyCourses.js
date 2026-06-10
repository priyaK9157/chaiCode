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
    <div className="flex flex-col gap-5 px-6 md:px-12 lg:px-28 py-10 md:py-20">
        <h1 className="text-white text-3xl">Udemy Courses</h1>
        <p className="text-lg text-neutral-400">Learn at your own pace with structured, <span className="text-orange-100 text-lg">high-quality video lessons</span>, designed to give you real-world skills and flexibility.</p>
      {/* Slider Wrapper */}
      <div className="w-full max-w-6xl mx-auto">
        <Swiper
          modules={[Navigation, Autoplay]} 
          spaceBetween={50}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 50 },
          }}
          navigation={{
            nextEl: ".udemy-next",
            prevEl: ".udemy-prev",
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
        <button className="udemy-prev border border-gray-800 rounded-full transition-transform duration-300 hover:scale-105 cursor-pointer p-1">
          <MdOutlineKeyboardArrowLeft size={30} />
        </button>
        <button className="udemy-next border border-gray-800 rounded-full transition-transform duration-300 hover:scale-105 cursor-pointer p-1">
          <MdKeyboardArrowRight size={30} />
        </button>
      </div>
    </div>
  );
};

export default UdemyCourses;
