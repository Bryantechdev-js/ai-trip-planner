import { Menu } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Testnav() {
  const navItemsArray = [
    {
      name: 'Home',
      path: '/',
    },
    {
      name: 'About',
      path: '/about',
    },
    {
      name: 'Pricing',
      path: '/pricing',
    },
    {
      name: 'contact',
      path: '/contact',
    },
  ]
  return (
    <div className="w-full h-25 bg-light shadow flex justify-content-between items-center relative">
      <div className="logo text-2xl cursor-pointer">Trip-ai</div>
      <ul className="nav-menu flex-column md:flex gap-5 absolute left-0 bottom-100 w-full h-25 ">
        {navItemsArray &&
          navItemsArray.map((item, i) => (
            <Link href={item.path} key={i}>
              <li className="text-1xl cursor-pointer w-full h-auto hover:bg-primary">
                {item.name}
              </li>
            </Link>
          ))}
      </ul>
      <div className="toggleMenu md:hidden w-auto h-auto bg-primary">
        <Menu></Menu>
      </div>
    </div>
  )
}

export default Testnav
