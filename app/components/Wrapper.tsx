 // @ts-nocheck
import React from 'react'
import Navbar from './Navbar'

type WrapperProps = {
  children: React.ReactNode
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div className='min-h-screen bg-base-100'>
      <Navbar />
      <main className='px-5 md:px-[10%] py-8 max-w-[1400px] mx-auto'>
        {children}
      </main>
    </div>
  )
}

export default Wrapper