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

  <div className="absolute left-20 top-[35%] max-w-xl">

    <h1 className="text-7xl font-serif text-green-900">

      Therapy for Mind & Soul

    </h1>

    <p className="mt-6 text-xl text-green-800 leading-relaxed">

      Meditation and mindfulness for a healthier,

      calmer and more balanced life.

    </p>

  </div >
  
  <Button className="absolute top-[50%] left-[70%]  " variant="">
    <Link to="/register">Get Started</Link>
  </Button>

   <Button className="absolute top-[50%] left-[70%] -translate-x-30 " variant="outline">
    <Link to="/login">Login</Link>
  </Button>


</section>
 
  )
}

export default Homepage