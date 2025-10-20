'use client'

import Chartbox from '@/components/newTripCompunents/Chartbox'
import React from 'react'
import { useTripContext } from '@/contex/TripContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Calendar, Users, DollarSign, Heart } from 'lucide-react'

function CreateTrip() {
  const { tripData } = useTripContext()

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-8 min-h-screen'>
       <div className='order-2 lg:order-1'>
         <Chartbox/>
       </div>
       <div className='order-1 lg:order-2 space-y-4'>
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
