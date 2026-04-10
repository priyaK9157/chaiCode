import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation  } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  MdOutlineKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";

const Interview = () => {
const image = [

    {   src: "https://chaicode.com/assets/computer-networking-BJe9ZQrS.webp",

        title: "Genai with Py"

    },

    {

        src: "https://chaicode.com/assets/operating-systems-DLPe8bi8.webp",

        title: "Data Science"

    },

    {

        src: "https://chaicode.com/assets/dbms-BpPiFUXp.webp",

        title: "Dsa with Cpp"

    },

    {

        src: "https://chaicode.com/assets/system-design-DGiPm1S3.webp",

        title: "Dsa with Java"

    },

    {

        src: "https://chaicode.com/assets/dsa-java-BcGlpB3V.webp",

        title: "Data Science"

    },

    {

        src: "https://chaicode.com/assets/dsa-cpp-lnoaJzCF.webp",

        title: "Dsa with Cpp"

    }

  ];

  return (
    <div className="flex flex-col gap-5 px-28 py-20">
        <h1 className="text-white text-3xl">Interview Preparation</h1>
        <p className="text-lg text-neutral-400">Build job-ready skills with our <span className="text-orange-100 text-lg">comprehensive interview preparation bundle</span> that includes multiple courses like</p>
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

export default Interview;
