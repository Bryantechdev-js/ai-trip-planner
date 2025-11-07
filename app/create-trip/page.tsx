'use client'

import Chartbox from '@/components/newTripCompunents/Chartbox'
import React, { useEffect, useState } from 'react'
import { useTripContext } from '@/contex/TripContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, DollarSign, Heart, AlertTriangle, CreditCard, Clock } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TripLimitStatus {
  remaining: number
  canCreateTrip: boolean
  subscription: string
  planLimits: {
    trips: number
    intervalName: string
    price: string
    currency: string
  }
  dueDate?: string
}

function CreateTrip() {
  const { tripData } = useTripContext()
  const { user } = useUser()
  const router = useRouter()
  const [tripLimitStatus, setTripLimitStatus] = useState<TripLimitStatus | null>(null)
  const [isCheckingLimit, setIsCheckingLimit] = useState(true)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  
  useEffect(() => {
    const checkTripLimit = async () => {
      if (!user) {
        setIsCheckingLimit(false)
        return
      }
      
      try {
        const response = await fetch('/api/trip-limit', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setTripLimitStatus(data)
          
          if (!data.canCreateTrip) {
            setShowLimitWarning(true)
          }
        }
      } catch (error) {
        console.error('Failed to check trip limit:', error)
      } finally {
        setIsCheckingLimit(false)
      }
    }
    
    checkTripLimit()
  }, [user])
  
  const handleUpgradeClick = () => {
    router.push('/pricing')
  }
  
  if (isCheckingLimit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your trip limits...</p>
        </div>
      </div>
    )
  }
  
  if (showLimitWarning && tripLimitStatus && !tripLimitStatus.canCreateTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trip Limit Reached
            </h2>
            
            <p className="text-gray-600 mb-6">
              You've reached your {tripLimitStatus.planLimits.intervalName} limit of {tripLimitStatus.planLimits.trips} trip{tripLimitStatus.planLimits.trips > 1 ? 's' : ''}.
              Upgrade your plan to create more amazing trips!
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Plan:</span>
                <span className="font-medium capitalize">{tripLimitStatus.subscription}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Trips Remaining:</span>
                <span className="font-medium text-red-600">{tripLimitStatus.remaining}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button onClick={handleUpgradeClick} className="w-full flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Upgrade Plan
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')} 
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-8 min-h-screen'>
       <div className='order-2 lg:order-1'>
         <Chartbox/>
       </div>
       <div className='order-1 lg:order-2 space-y-4'>
         {/* Trip Limit Status */}
         {tripLimitStatus && (
           <Card className='bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'>
             <CardContent className='p-4'>
               <div className='flex items-center justify-between'>
                 <div className='flex items-center gap-3'>
                   <Clock className='w-5 h-5 text-blue-600' />
                   <div>
                     <p className='font-medium text-blue-900'>Trip Limit Status</p>
                     <p className='text-sm text-blue-700'>
                       {tripLimitStatus.remaining === -1 ? 'Unlimited' : tripLimitStatus.remaining} trips remaining
                     </p>
                   </div>
                 </div>
                 <div className='text-right'>
                   <p className='text-sm font-medium text-blue-900 capitalize'>{tripLimitStatus.subscription} Plan</p>
                   {tripLimitStatus.subscription === 'basic' && (
                     <Link href='/pricing'>
                       <Button size='sm' variant='outline' className='mt-1 text-xs'>
                         Upgrade
                       </Button>
                     </Link>
                   )}
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
         <Card className='sticky top-4'>
           <CardHeader>
             <CardTitle className='flex items-center gap-2'>
               <MapPin className='w-5 h-5 text-primary' />
               Trip Preview
             </CardTitle>
           </CardHeader>
           <CardContent className='space-y-4'>
             {tripData.destination ? (
               <div className='space-y-3'>
                 <div className='p-3 bg-primary/5 rounded-lg'>
                   <h3 className='font-semibold text-primary'>{tripData.destination}</h3>
                   {tripData.sourceLocation && (
                     <p className='text-sm text-gray-600'>From {tripData.sourceLocation}</p>
                   )}
                 </div>
                 
                 <div className='grid grid-cols-2 gap-3'>
                   {tripData.duration > 0 && (
                     <div className='flex items-center gap-2 text-sm'>
                       <Calendar className='w-4 h-4 text-blue-500' />
                       <span>{tripData.duration} days</span>
                     </div>
                   )}
                   {tripData.groupSize && (
                     <div className='flex items-center gap-2 text-sm'>
                       <Users className='w-4 h-4 text-green-500' />
                       <span>{tripData.groupSize}</span>
                     </div>
                   )}
                   {tripData.budget && (
                     <div className='flex items-center gap-2 text-sm col-span-2'>
                       <DollarSign className='w-4 h-4 text-yellow-500' />
                       <span>{tripData.budget}</span>
                     </div>
                   )}
                 </div>

                 {tripData.interests.length > 0 && (
                   <div>
                     <div className='flex items-center gap-2 mb-2'>
                       <Heart className='w-4 h-4 text-red-500' />
                       <span className='text-sm font-medium'>Interests</span>
                     </div>
                     <div className='flex flex-wrap gap-1'>
                       {tripData.interests.map((interest, idx) => (
                         <span key={idx} className='px-2 py-1 bg-primary/10 text-primary text-xs rounded-full'>
                           {interest}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 {tripData.locationData?.attractions && tripData.locationData.attractions.length > 0 && (
                   <div>
                     <h4 className='font-medium text-gray-700 mb-2'>Attractions</h4>
                     <ul className='text-sm text-gray-600 space-y-1'>
                       {tripData.locationData.attractions.slice(0, 5).map((attraction, idx) => (
                         <li key={idx} className='flex items-center gap-2'>
                           <div className='w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0'></div>
                           {attraction}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
             ) : (
               <div className='text-center py-8 text-gray-500'>
                 <MapPin className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                 <p>Start planning your trip!</p>
                 <p className='text-sm'>Your trip details will appear here as you chat with the AI.</p>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
    </div>
  )
}

export default CreateTrip
