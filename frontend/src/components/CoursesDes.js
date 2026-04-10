import Button from "../common/Button"
import { HiOutlineArrowLeft } from "react-icons/hi";
import { BiHome, BiSolidBookContent, BiConfused   } from "react-icons/bi";
import { SlCalender } from "react-icons/sl";

const CoursesDes = () => {
    return (
        <div className="bg-[oklch(29.3%_0.066_243.157)] h-screen text-white open-sans-regular">
            <div className="flex justify-between px-10 py-5">
                <div className="flex items-center gap-3">
                    <HiOutlineArrowLeft />
                    <p>GenAI With Python 2.0</p>
                </div>
                <div className="flex gap-4">
                    <Button className="text-orange-500 font-semibold border-2 border-orange-500">
                        Sign In
                    </Button>
                    <Button className="bg-orange-500 text-black">
                        Sign Up
                    </Button>
                </div>
            </div>
            <hr />
            <div className="flex justify-between px-10 py-6">
                <div className="flex flex-col gap-4 text-lg ">
                    <p className="flex items-center gap-2"> <BiHome />Dashboard</p>
                    <p className="flex items-center gap-2"><SlCalender />Calender</p>
                    <p className="flex items-center gap-2"><BiSolidBookContent />Content</p>
                    <p className="flex items-center gap-2"><BiConfused />About</p>
                </div>
                <div className="flex flex-col">
                    <h2 className="text-xl pb-6">About</h2>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold">GenAI with Python 2.0</h1>
                        <p className="text-xl">Enter into the world of GenAI with consistency and community</p>
                        <h1 className="text-2xl">About This Batch</h1>
                    </div>
                </div>
                
                
                <div></div>
            </div>

            
        </div>
    )
}

export default CoursesDes;