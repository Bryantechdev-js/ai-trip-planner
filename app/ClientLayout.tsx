'use client'

import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useContext, useEffect, useState } from 'react'
import { UserDetailContext } from '@/contex/UserDetailContext'
import { TripProvider } from '@/contex/TripContext'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [userDetails, setUserDetails] = useState<Record<string, unknown>>({})
  const CreateUser = useMutation(api.CreateNewUser.CreateNewUser)
  const { user } = useUser()

  const CreateNewUser = async () => {
    if (user) {
      const result = await CreateUser({
        name: user?.fullName || '',
        email: user?.emailAddresses[0]?.emailAddress || '',
        imageUrl: user?.imageUrl || '',
      })
    }
  }

  useEffect(() => {
    user && CreateNewUser()
    setUserDetails(user)
  }, [user])

  return (
    <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
      <TripProvider>{children}</TripProvider>
    </UserDetailContext.Provider>
  )
}

export const useUserDetail = () => {
  return useContext(UserDetailContext)
}
