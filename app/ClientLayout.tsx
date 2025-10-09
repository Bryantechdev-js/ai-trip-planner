"use client"

import { useUser } from '@clerk/nextjs'
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const CreateUser = useMutation(api.CreateNewUser.CreateNewUser)
  const { user } = useUser()
  
  useEffect(() => {
    user && CreateNewUser()
  }, [user])
    
  const CreateNewUser = async () => {
    if (user) {
      const result = await CreateUser({
        name: user?.fullName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        imageUrl: user?.imageUrl || ""
      })
    }
  }

  return <>{children}</>
}