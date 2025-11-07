import { SignUp } from '@clerk/nextjs'
import { div } from 'motion/react-client'

export default function Page() {
  return (
    <div className=" w-full flex justify-center items-center h-screen">
      <SignUp />
    </div>
  )
}
