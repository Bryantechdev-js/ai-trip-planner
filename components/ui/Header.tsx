// import { Link } from 'lucide-react'
'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from './button'
import { Menu, X } from 'lucide-react'
import { SignInButton, SignOutButton, UserProfile, useUser } from '@clerk/nextjs'
function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuOptions = [
    {
      name: 'Home',
      link: '/',
    },
    {
      name: 'About',
      link: '/about',
    },
    {
      name: 'Bookings',
      link: '/bookings',
    },
    {
      name: 'Tracking',
      link: '/tracking',
    },
    {
      name: 'Trends',
      link: '/trends',
    },
    {
      name: 'Pricing',
      link: '/pricing',
    },
    {
      name: 'Contact',
      link: '/contact',
    },
  ]

  const { user } = useUser()

  return (
    <>
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-3 sm:py-5 shadow-md relative">
        <div className="logo flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} className="sm:w-10 sm:h-10" />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold">AI Trip Planner</span>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:block">
          <ul className="flex items-center gap-4 lg:gap-8">
            {menuOptions.map((option, index) => (
              <Link key={index} href={option.link}>
                <li className="text-sm lg:text-lg hover:scale-105 transition hover:text-primary">
                  {option.name}
                </li>
              </Link>
            ))}
          </ul>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
          {!user ? (
            <Button variant={'default'} className="cursor-pointer text-xs sm:text-sm px-3 py-2">
              <SignInButton>
                <span>Sign In</span>
              </SignInButton>
            </Button>
          ) : (
            <>
              <Button variant={'default'} className="cursor-pointer text-xs sm:text-sm px-3 py-2">
                <SignOutButton>
                  <span>Sign Out</span>
                </SignOutButton>
              </Button>
              <Link href={'/dashboard'}>
                <Button
                  variant={'default'}
                  className="bg-primary cursor-pointer text-xs sm:text-sm px-3 py-2 mr-2"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href={'/create-trip'}>
                <Button
                  variant={'default'}
                  className="bg-primary cursor-pointer text-xs sm:text-sm px-3 py-2"
                >
                  Create Trip
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {menuOptions.map((option, index) => (
              <Link key={index} href={option.link} onClick={() => setIsMobileMenuOpen(false)}>
                <div className="block py-2 text-lg hover:text-primary transition">
                  {option.name}
                </div>
              </Link>
            ))}
            <div className="pt-4 border-t space-y-2 flex space-x-2.5">
              {!user ? (
                <Button variant={'default'} className="w-full cursor-pointer">
                  <SignInButton>
                    <span>Sign In</span>
                  </SignInButton>
                </Button>
              ) : (
                <>
                  <Link href={'/dashboard'} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant={'default'} className="w-full bg-primary cursor-pointer mb-2">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href={'/create-trip'} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant={'default'} className="w-full bg-primary cursor-pointer mb-2">
                      Create new Trip
                    </Button>
                  </Link>
                </>
              )}
              <UserProfile />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
