import React from 'react'
import lectures from "../../public/lectures.png"
const Services = () => {
    const services = [
        {name: "Lectures",
            image: lectures
        },
        {name: "Make Schedules",
            image: lectures
        },
        {name: "E-Book Library",
            image: lectures
        },
        {name: "Performance Analysis",
            image: lectures
        },
        {name: "Generate Quizes",
            image: lectures
        },
        {name: "BrainStorm with Others",
            image: lectures
        },
        {name: "Lectures",
            image: lectures
        },

    ]
  return (
    <div className='w-full h-[100vh] py-10 flex flex-col justify-start items-center'>
        <div className='flex justify-between items-center'>
            <h1 className='font-monts font-bold text-5xl text-white px-8 py-4 rounded-full bg-[#2A4674] mt-5'>Explore Our Services</h1>
            <div></div>
        </div>
        <div className='mt-10'>
            <div className='bg-[#FFE8D6] w-[200px] h-[150px] rounded-xl flex justify-center items-center px-8 border-4 border-[#2A4674] overflow-hidden'>
                <img src={lectures} alt="" />
            </div>
        </div>
    </div>
  )
}

export default Services