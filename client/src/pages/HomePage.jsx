import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Services from '../components/Services'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div>
        <Hero/>
        <Services/>
    </div>
  )
}

export default HomePage