import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-accent/10 to-accent-content/5'>
        <div className='w-full max-w-md'>
          <SignUp />
        </div>
    </div>
  )
}

export default page