import React from 'react'
import Img from '@/assets/BG.png'

export const Layout = ({ children }) => {
  return (
    <div className="relative h-screen bg-cover bg-center" style={{ backgroundImage: `url(${Img})` }}>
      {children}
      <div className="absolute left-20 top-[35%] max-w-xl">
    
        
    
        
    
        
      </div>
     
    
    </div>
  )
}

export default Layout