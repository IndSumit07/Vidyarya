import React, { useContext } from 'react'
import Arrow from "../../public/Arrow.png"
import bulb from "../../public/bulb.png"
import clickhere from "../../public/clickme.png"
import pencil from "../../public/pensil.png"
import curl from "../../public/curl.png"
import { AppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'
const Hero = () => {
    const { isLoggedIn } = useContext(AppContext);
  return (
    <div className='w-full h-[calc(100vh-80px)] overflow-hidden flex justify-center items-center'>
        <div className='w-2/5 h-full'>
            <img src="https://welcometoschat.my.canva.site/generate-quiz/_assets/media/20109aa02c5371deca8cd987a3db4d15.png" alt="" className='w-full mt-20 ml-10'/>
        </div>
        <div className='w-3/5 h-full bg-transparent flex justify-center items-start pl-20 flex-col relative'>
            <h1 className='text-[#2A4674] font-black text-7xl font-monts leading-snug'>SMART <br /> LEARNING <br /> FOR SMART <br />FUTURE</h1>
            <Link to="/login" className='bg-[#FFB72C] flex justify-center items-center gap-3 text-white font-monts font-bold px-5 py-3 rounded-full text-xl mt-2'> <div className='w-5 h-5 rounded-full bg-white '></div >{!isLoggedIn ? "JOIN US" : "Explore"}</Link>
            <div className='bg-transparent'><img src={Arrow} alt="" className='absolute left-[300px] top-52 bg-transparent'/></div>
            <div className='bg-transparent'><img src={bulb} alt="" className='absolute -right-[200px] -top-52 bg-transparent'/></div>
            {!isLoggedIn && (<div className='bg-transparent'><img src={clickhere} alt="" className='absolute -right-[130px] -top-48 bg-transparent w-[60%]'/></div>)}
            <div className='bg-transparent'><img src={pencil} alt="" className='absolute -right-[180px] -bottom-40 bg-transparent w-[60%]'/></div>
            <div className='bg-transparent'><img src={curl} alt="" className='absolute -right-[300px] -bottom-[520px]  bg-transparent '/></div>
        </div>
        
    </div>
  )
}

export default Hero