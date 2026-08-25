"use client"
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { Sparkle, Sparkles } from 'lucide-react'
import React from 'react'

const WelcomeBanner = () => {
  const {user} = useUser()
  return (
    <div>
      <div className='p-10 border rounded-xl bg-gradient-to-r from-blue-200 to-purple-200'>
        <h2 className='text-2xl font-bold'>Welcome Back, {user?.fullName}</h2>
        <p className='mt-2 '>Bring Your Ideas to Life on infinite canvas</p>

        <div className='flex items-center gap-2 mt-5'>
          <Button size="lg">+ Create New Board</Button>
          <Button size="lg" variant="outline"><Sparkles/>AI helper</Button>
        </div>                                                      
      </div>
    </div>
  )
}

export default WelcomeBanner