import { GoArrowUpRight } from "react-icons/go";
import { RxDoubleArrowDown } from "react-icons/rx";
import { useState, useEffect } from "react"

const Main = ({images, images1}) => {
    const [visibleImage, setVisibleImage] = useState(0);

    useEffect(() => {
        if (!images || !images.length) return;
        const interval = setInterval(() => {
            setVisibleImage((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images]);

    return (
        <div className='px-6 md:px-12 lg:px-28 '>
            {/* Main Section */}
            <main className='flex flex-col pt-24 md:pt-32'>
                <div className='flex flex-col lg:flex-row gap-10 items-center justify-between'>
                    {/* Left part */}
                    <div className="flex flex-col gap-4 text-center lg:text-left">
                        <div>
                            <span className='text-white text-xs md:text-sm bg-brown-800 rounded-full py-1 px-3 bg-white/5 border border-white/10'>
                                Trusted by 1.5M+ Developers Worldwide
                            </span>
                        </div>

                        <div className='pt-6 md:py-10'>
                            <h1 className='text-white text-4xl md:text-5xl lg:text-7xl font-semibold open-sans-bold leading-tight'>
                                Consistency and Community
                            </h1>
                        </div>

                        <span className='text-neutral-400 text-base md:text-xl open-sans-light'>
                            Content is everywhere. We provide what is rare <span className='capitalize text-orange-100'>“an unmatched, community-driven learning experience”</span> with peer learning, bounties, code reviews, doubt sessions, alumni network.
                        </span>

                        <div className='py-10 border-red-800'>
                            <a href="/cohorts" className='inline-flex items-center justify-between gap-3'>
                                <div className='text-black text-sm bg-white p-2 rounded-md flex gap-0.5 items-center hover:scale-105 transition-transform cursor-pointer'>
                                    <span>Start Learning</span>
                                    <GoArrowUpRight />
                                </div>
                                <div className='text-white text-sm bg-black border border-neutral-800 p-2 rounded-md flex gap-0.5 items-center hover:bg-neutral-900 transition-colors cursor-pointer'>
                                    <span>See The Impact</span>
                                    <RxDoubleArrowDown /> 
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Right part */}
                    <div className="relative w-full max-w-2xl aspect-[17/10] lg:w-[500px] xl:w-[600px] lg:h-[280px] xl:h-[350px] flex-shrink-0">
                        {images.map((src, index) => (
                            <img 
                                key={index}
                                src={src}
                                alt="hero-img"
                                className={`absolute w-full h-full object-cover rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] shadow-2xl transition-opacity duration-500 ${
                                    visibleImage === index ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </main>

            <div className="flex flex-col gap-4 mt-16 md:mt-24">
                <h1 className="text-3xl text-white text-center lg:text-left">Trending</h1>
                <p className="text-lg text-neutral-400 text-center lg:text-left">
                    Latest and most impactful course that combine fresh insights with real-world application.
                </p>
                <div className="relative w-full max-w-3xl aspect-[16/10] mx-auto overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    {images1.map((img, index) => (
                        <img 
                            src={img.src}
                            key={index}
                            alt="trending-img"
                            className={`absolute inset-0 object-cover h-full w-full transition-opacity duration-500 ${
                                index === visibleImage ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Subtitle Section */}
            <div className="h-10 text-center flex justify-center py-2 text-base text-neutral-400 mt-4">
                {images1.map((item, index) => (
                    <p 
                        key={index}
                        className={`absolute text-center text-white text-xl font-medium transition-all duration-700 ${
                            visibleImage === index 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 translate-y-2'
                        }`}
                    >
                        {item.title}
                    </p>
                ))}
            </div>
        </div>
    );
}

export default Main;