import Button from "../common/Button"
import { HiOutlineArrowLeft } from "react-icons/hi";
import { BiHome, BiSolidBookContent, BiConfused   } from "react-icons/bi";
import { SlCalender } from "react-icons/sl";

const CoursesDes = () => {
    return (
        <div className="bg-[oklch(29.3%_0.066_243.157)] min-h-screen text-white open-sans-regular">
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-10 py-5 gap-4">
                <div className="flex items-center gap-3">
                    <HiOutlineArrowLeft className="text-xl cursor-pointer" />
                    <p className="font-bold text-lg">GenAI With Python 2.0</p>
                </div>
                <div className="flex gap-4">
                    <Button className="text-orange-500 font-semibold border-2 border-orange-500 hover:bg-orange-500/10 transition-colors">
                        Sign In
                    </Button>
                    <Button className="bg-orange-500 text-black hover:bg-orange-400 transition-colors">
                        Sign Up
                    </Button>
                </div>
            </div>
            <hr className="border-neutral-800" />
            <div className="flex flex-col md:flex-row gap-8 px-6 md:px-10 py-6">
                <div className="flex flex-row md:flex-col gap-4 text-base md:text-lg overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-neutral-800 pr-0 md:pr-8 flex-shrink-0">
                    <p className="flex items-center gap-2 cursor-pointer hover:text-orange-500 transition-colors"> <BiHome />Dashboard</p>
                    <p className="flex items-center gap-2 cursor-pointer hover:text-orange-500 transition-colors"><SlCalender />Calender</p>
                    <p className="flex items-center gap-2 cursor-pointer hover:text-orange-500 transition-colors"><BiSolidBookContent />Content</p>
                    <p className="flex items-center gap-2 cursor-pointer hover:text-orange-500 transition-colors"><BiConfused />About</p>
                </div>
                <div className="flex flex-col flex-grow">
                    <h2 className="text-2xl font-bold pb-4 border-b border-neutral-800 mb-6">About</h2>
                    <div className="flex flex-col gap-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-glow">GenAI with Python 2.0</h1>
                        <p className="text-lg md:text-xl text-neutral-300">Enter into the world of GenAI with consistency and community</p>
                        <h1 className="text-2xl font-bold mt-4 text-orange-400">About This Batch</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CoursesDes;