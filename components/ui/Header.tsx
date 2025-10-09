// import { Link } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './button'

function Header() {
    const menuOptions = [
        {
            name: "Home", link: "/"
        },
        {
            name: "About",
            link: "/about"
        },
        {
            name: "Pricing", link: "/pricing"
        },
        {
            name: "Contact", link: "/contact"
        }
    ]
  return (
    <div className='flex justify-between items-center px-10 py-5 shadow-md '>
      <div className="logo flex items-center gap-2 ">
        <Image src="/logo.svg" alt="Logo" width={40} height={40} />
        <span className="text-2xl font-bold">AI Trip Planner</span>
      </div>
      {/* {menu options} */}

        <div>
            <ul className='flex items-center gap-8'>
                {menuOptions.map((option,index) => (
                     <Link key={index} href={option.link}>
                         <li className='text-lg hover:scale-105 transition hover:text-primary'>
                            {option.name}
                         </li>
                     </Link>
                   
                ))}
            </ul>
        </div>
        <Button variant={"default"}>Get Started</Button>

    </div>
  )
}

export default Header
