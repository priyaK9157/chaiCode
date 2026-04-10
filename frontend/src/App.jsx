import {useState, useEffect} from "react"
import { Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from "./common/Navbar"
import BackgroundImage from "./common/BackgroundImage";
import Footer from "./components/Footer"
import Cohort from "./components/Cohort";
import Reviews from "./components/Reviews";
import UdemyCourses from "./components/UdemyCourses"
import Interview from "./components/Interview"
import Main from "./components/Main"
import Description from "./components/CohortDes"
import Signup from "./components/Signup"
import Login from "./components/Login"
import Otp from "./components/Otp"
import ForgotPassword from "./components/ForgotPassword"
import ResetPassword from "./components/ResetPassword"
import AccountSettings from "./components/AccountSettings"
import InstructorDashboard from "./components/InstructorDashboard";
import AddCourse from "./components/AddCourse";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentCancel from "./components/PaymentCancel";
import InstructorCourseDetails from "./components/InstructorCourseDetails";

function App() {
  // const [visibleImage, setVisibleImage] = useState(0);
  const images = [
    "https://chaicode.com/assets/black-3-Bm-S1mSe.webp",
    "https://chaicode.com/assets/white-3-CGLYt1t0.webp",
  ];

  const images1 = [
    {
      src:"https://chaicode.com/assets/interview-prep-dark-EHhDScRG.webp",
      title: "Interview Preparation",
    },
    {
      src:"https://chaicode.com/assets/cohort-webdev-light-C96Mvf6.webp",
      title: "Web Development Cohort"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // setVisibleImage((prev) => (prev+1) % images.length)
    }, 3000)
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className=''>
       <BackgroundImage />
       <Navbar />
       
       <Routes>
         <Route path="/" element={
           <>
              <Main images={images} images1={images1} />
              <Cohort />
              <UdemyCourses />
              <Interview/>
              <Reviews/>
           </>
         } />
         <Route path="/signup" element={<Signup />} />
         <Route path="/login" element={<Login />} />
         <Route path="/otp" element={<Otp />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
         <Route path="/settings" element={<AccountSettings />} />
         <Route path="/cohorts" element={<Cohort />} />
         <Route path="/interview" element={<Interview />} />
         <Route path="/reviews" element={<Reviews />} />
         <Route path="/instructor" element={<InstructorDashboard />} />
         <Route path="/instructor/course/:id" element={<InstructorCourseDetails />} />
         <Route path="/instructor/add-course" element={<AddCourse />} />
         <Route path="/cohort/:id" element={<Description />} />
         <Route path="/payment/success" element={<PaymentSuccess />} />
         <Route path="/payment/cancel" element={<PaymentCancel />} />
       </Routes>
       
       <Footer />
    </section>
  );
}

export default App;
