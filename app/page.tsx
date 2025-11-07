import Hero from '@/components/Hero'
import PublicTrips from '@/components/PublicTrips'
import { Button } from '@/components/ui/button'
import { currentUser } from '@clerk/nextjs/server'
import { IconSettingsStar } from '@tabler/icons-react'
import { Send } from 'lucide-react'
import { symbol } from 'motion/react-client'
// import { useUser } from "@clerk/nextjs";
import Image from 'next/image'

export default function Home() {
  // const userInfo =  currentUser()
  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PublicTrips />
      </div>
    </>
  )
}
