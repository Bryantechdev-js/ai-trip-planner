"use client"
import React from 'react'
import { Textarea } from './ui/textarea'
import { Globe2, Landmark, Plane, Send } from 'lucide-react'
import { Button } from './ui/button'
import { HeroVideoDialog } from './ui/hero-video-dialog'
import ImageCarousel from './ImageCarousel'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { IconSquareRoundedLetterJ } from '@tabler/icons-react'

function Hero() {
    const suggestionList = [  
        {
          title:"create a new trip to spain",
          icon: <Globe2 className='text-blue-400 h-5 w-5'/>
        },
        {
            title:"find me a hotel in new york",
            icon:<Plane className='text-green-500 h-5'/>
        },
        {
            title:"Discover hidden gems",
            icon:<Landmark className='text-orange-500 h-5'/>
        },
        {
            title:"adventure destinations",
            icon:<Globe2 className='text-yellow-600 h-5 w-5'/>
        }
    ]
    const {user} = useUser();
  const router = useRouter()
  const onSend =()=>{
    if(!user){
      router.push('/sign-in')
      return;
    }
    router.push("/create-trip")
}
    // create trip planer screen
  return (
     <section className='mt-12 sm:mt-24 flex items-center justify-center px-4'>

        <div className='max-w-full text-center space-y-4 sm:space-y-6 animate-fadeIn'>
            <h1 className='text-2xl sm:text-3xl md:text-5xl font-bold leading-tight'>{!user ? 'Hey' : `Welcome back ${user?.firstName}`}, I'm your personal <span className='text-primary'>Trip Planner</span></h1>
            <p className='text-base sm:text-lg max-w-2xl mx-auto'>Tell me what you want, and I'll handle the rest: Flights, Hotels, trip planner</p>
            <div className='border rounded-2xl p-3 sm:p-4 relative max-w-2xl mx-auto transform hover:scale-105 transition-transform'>
                <Textarea placeholder='Create your trip today - Tell me where you want to go!' className='w-full h-20 sm:h-28 border-transparent focus-visible:ring-0 shadow-none resize-none text-sm sm:text-base'/>
                <Button size={"icon"} className='absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-primary text-white hover:bg-primary/80 transform hover:scale-110 transition-transform' onClick={async()=>await onSend()}>
                    <Send className='h-3 sm:h-4 w-3 sm:w-4'/>
                </Button>
            </div>
            {/* suggestion list */}
            {suggestionList.map((suggestion,index) => (
                <div 
                    key={index} 
                    onClick={onSend}
                    className='inline-flex items-center gap-2 border px-4 py-2 rounded-full hover:bg-primary hover:text-white hover:scale-105 transition cursor-pointer md:mx-2'
                >
                    {suggestion.icon}
                    <h2 className='text-xs sm:text-sm md:text-base'>{suggestion.title}</h2>
                </div>
            ))}

            {/* video sectio */}
            <HeroVideoDialog
            className="block dark:hidden w-full md:w-3/4 lg:w-1/2 mx-auto mt-10 rounded-lg overflow-hidden"
            animationStyle="from-center"
            videoSrc="https://www.pexels.com/download/video/3125427/"
            thumbnailSrc="data:image/jpeg;base64,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"
            thumbnailAlt="Dummy Video Thumbnail"
            />  
            {/* make slider  */}
          <ImageCarousel/>
        </div>
     </section> 
  )
}

export default Hero
