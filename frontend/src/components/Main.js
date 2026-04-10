import { GoArrowUpRight } from "react-icons/go";
import { RxDoubleArrowDown } from "react-icons/rx";
import {useState} from "react"


const Main = ({images, images1}) => {

    const [visibleImage] = useState(0);
    // const [cohortImage, setCohortImage] = useState(0)

    return <div className='px-28 '>
    
            {/* Main Section */}
            <main className='flex flex-col pt-32'>
              <div className='flex space-x-10 items-center justify-between'>
                {/* Left part */}
                <div>
                  
                    <span className='text-white rounded-full text-sm mt-10 bg-brown-800 rounded-full py-1 px-3'>Trusted by 1.5M+ Developers Worldwide</span>
    
                  <div className='py-10'>
                      <h1 className='text-white text-7xl font-semibold open-sans-bold'>Consistency and Community</h1>
                      {/* <h1 className='text-white text-7xl font-semibold'>and Community</h1> */}
                  </div>
    
                  <span className='text-neutral-400 text-xl open-sans-light'>Content is everywhere. We provide what is rare <span className='capitalize text-orange-100'>“an unmatched, community-driven learning experience”</span> with peer learning, bounties, code reviews, doubt sessions, alumni network.</span>
    
                  <div className='py-10 border-red-800'>
                    <a href="/cohorts/system-design" className='inline-flex items-center justify-between gap-3'>
                      <div className='text-black text-sm bg-white p-2 rounded-md flex gap-0.5 items-center'>
                        <span>Start Learing</span>
                        <GoArrowUpRight />
                      </div>
                      <div className='text-white text-sm bg-black p-2 rounded-md flex gap-0.5 items-center'>
                        <span>See The Impact</span>
                        <RxDoubleArrowDown /> 
                      </div>
                    </a>
                  </div>
                </div>
    
               
                  {/* Right part */}
                <div className="relative w-[850px] h-[350px]">
                  {
                    images.map((src, index) => (
                      <img 
                        key={index}
                        src={src}
                        alt="imgg"
                        className={`absolute w-full h-full object-cover rounded-full shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] shadow-2xl transition-opacity duration-500 ${
                          visibleImage === index ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    ))
                  }
                </div>
              </div>
            </main>
    
            {/* Trending */}
    
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl text-white">Trending</h1>
              <p className="text-lg text-neutral-400">Latest and most impactful course that combine fresh insights with real-world application.</p>
              <div className="relative w-[750px] h-[450px] flex-shrink-0 mx-auto overflow-hidden">
                {
                  images1.map((img, index) => (
                    <img 
                      src={img.src}
                      key={index}
                      alt="imgg"
                      className={`absolute inset-0 object-fill h-full w-full transition-opacity duration-500 ${index === visibleImage ? 'opacity-100' : 'opacity-0'}`}
                    />
                  ))
                }
              </div>
            </div>
                {/* Subtitle Section */}
            <div className="h-10 text-center flex justify-center border-red-600 py-2 text-base text-neutral-400"> {/* Fixed height taaki layout hile na */}
                {images1.map((item, index) => (
                  <p 
                    key={index}
                    className={`absolute text-center text-white text-xl font-medium transition-all duration-700 ${
                      visibleImage === index 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-2' // Absolute taaki ek ke upar ek rahein
                    }`}
                  >
                    {item.title}
                  </p>
                ))}
              </div>
    
    
          </div>
}


export default Main