'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { Menu, X, User, Settings, LogOut, Bell, Globe } from 'lucide-react'
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs'
import { Card, CardContent } from './card'

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [currentLanguage, setCurrentLanguage] = useState('en')

  const menuOptions = [
    { name: 'Home', link: '/' },
    { name: 'About', link: '/about' },
    { name: 'Bookings', link: '/bookings' },
    { name: 'Tracking', link: '/tracking' },
    { name: 'Trends', link: '/trends' },
    { name: 'Pricing', link: '/pricing' },
    { name: 'Contact', link: '/contact' },
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ]

  const { user } = useUser()

  useEffect(() => {
    // Fetch notifications count
    const fetchNotifications = async () => {
      if (user) {
        try {
          const response = await fetch('/api/notifications')
          const data = await response.json()
          setNotifications(data.unreadCount || 0)
        } catch (error) {
          console.error('Failed to fetch notifications:', error)
        }
      }
    }
    fetchNotifications()
  }, [user])

  const handleLanguageChange = async (langCode: string) => {
    setCurrentLanguage(langCode)
    try {
      await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: langCode })
      })
    } catch (error) {
      console.error('Language change failed:', error)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-3 sm:px-6 lg:px-10 py-2 sm:py-4">
          {/* Logo */}
          <Link href="/" className="logo flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.svg" alt="Logo" width={28} height={28} className="sm:w-10 sm:h-10" />
            <span className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Trip Planner
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-1 lg:gap-2">
              {menuOptions.map((option, index) => (
                <li key={index}>
                  <Link 
                    href={option.link}
                    className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
                  >
                    {option.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden lg:inline">{languages.find(l => l.code === currentLanguage)?.flag}</span>
              </button>
            </div>

            {!user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <SignInButton>
                    <span className="text-sm">Sign In</span>
                  </SignInButton>
                </Button>
                <Button size="sm">
                  <SignInButton>
                    <span className="text-sm">Get Started</span>
                  </SignInButton>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  )}
                </button>

                {/* Quick Actions */}
                <Link href="/create-trip">
                  <Button size="sm" className="text-sm">
                    Create Trip
                  </Button>
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      {user.imageUrl ? (
                        <Image src={user.imageUrl} alt="Profile" width={32} height={32} className="rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <Card className="absolute right-0 top-full mt-2 w-64 shadow-lg border z-50">
                      <CardContent className="p-0">
                        <div className="p-4 border-b">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                              {user.imageUrl ? (
                                <Image src={user.imageUrl} alt="Profile" width={48} height={48} className="rounded-full" />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{user.fullName || user.firstName}</p>
                              <p className="text-xs text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors">
                            <User className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors text-red-600">
                            <SignOutButton>
                              <div className="flex items-center gap-3">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                              </div>
                            </SignOutButton>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {menuOptions.map((option, index) => (
                <Link 
                  key={index} 
                  href={option.link} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  {option.name}
                </Link>
              ))}
              
              {/* Mobile Language Selector */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Language</p>
                <div className="grid grid-cols-2 gap-2">
                  {languages.slice(0, 4).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLanguage === lang.code ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t space-y-3">
                {!user ? (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <SignInButton>
                        <span>Sign In</span>
                      </SignInButton>
                    </Button>
                    <Button className="w-full">
                      <SignInButton>
                        <span>Get Started</span>
                      </SignInButton>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        {user.imageUrl ? (
                          <Image src={user.imageUrl} alt="Profile" width={40} height={40} className="rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user.fullName || user.firstName}</p>
                        <p className="text-xs text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                    
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    
                    <Link href="/create-trip" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full justify-start">
                        Create Trip
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      <SignOutButton>
                        <div className="flex items-center">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </div>
                      </SignOutButton>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Click outside to close dropdowns */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsUserMenuOpen(false)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </>
  )
}

export default Header
