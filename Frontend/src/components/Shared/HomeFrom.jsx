import React from 'react'
import { Link } from 'react-router-dom'

import Img from '../../assets/BG.png'
import { Button } from '../ui/button'





export const Homepage = () => {
  return (
   <section

  className="relative h-screen bg-cover bg-center"

  style={{ backgroundImage: `url(${Img})` }}

>

  <div className="absolute top-10 left-4 sm:top-[35%] sm:left-20 max-w-xs sm:max-w-xl">

    <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif text-green-900">

      Therapy for Mind & Soul

    </h1>

    <p className="mt-3 sm:mt-6 text-sm sm:text-lg md:text-xl text-green-800 leading-relaxed">

      Meditation and mindfulness for a healthier,

      calmer and more balanced life.

    </p>

  </div >
  
  <div className="absolute bottom-6 right-4 left-4 flex flex-col gap-3 sm:flex-row sm:bottom-auto sm:top-[50%] sm:left-[70%] sm:-translate-x-1/2">
    <Button className="w-full sm:w-auto" variant="">
      <Link to="/register">Get Started</Link>
    </Button>

    <Button className="w-full sm:w-auto" variant="outline">
      <Link to="/login">Login</Link>
    </Button>
  </div>


</section>
 
  )
}

export default Homepage