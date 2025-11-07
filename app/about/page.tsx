'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Zap, Shield, Globe, Compass } from 'lucide-react'
import Link from 'next/link'

const About = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "AI-Powered Planning",
      description: "Advanced artificial intelligence creates personalized itineraries based on your preferences, budget, and travel style with real-time optimization."
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      title: "Real-Time Tracking",
      description: "Stay safe with GPS tracking, emergency contacts, location sharing, and automatic safety alerts during your journey."
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "Group Collaboration",
      description: "Plan with friends and family using shared itineraries, voting on activities, and collaborative budget management."
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "Safety & Security",
      description: "Enterprise-grade security with risk assessment, emergency protocols, and 24/7 support for peace of mind."
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-500" />,
      title: "Global Coverage",
      description: "Explore 50+ countries with local insights, cultural tips, weather integration, and authentic experiences."
    },
    {
      icon: <Compass className="w-8 h-8 text-teal-500" />,
      title: "Virtual Tours",
      description: "Preview destinations with 360° virtual tours, Street View integration, and immersive media galleries."
    }
  ]

  const stats = [
    { number: "25K+", label: "Trips Planned" },
    { number: "50+", label: "Countries Covered" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "AI Support" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Globe className="w-16 h-16 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">About AI Trip Planner</h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Revolutionizing travel planning with artificial intelligence to create unforgettable journeys tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-trip">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Start Planning Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We believe that everyone deserves to experience the world without the stress of complex planning. 
              Our AI-powered platform transforms your travel dreams into detailed, personalized itineraries, 
              making every journey memorable and hassle-free.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose AI Trip Planner?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of travel planning with our cutting-edge features designed to make your journey extraordinary.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Creating your perfect trip is as easy as 1-2-3 with our intelligent planning system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Tell Us Your Preferences</h3>
              <p className="text-gray-600">
                Share your destination, budget, interests, and travel style. Our AI listens to every detail.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Creates Your Plan</h3>
              <p className="text-gray-600">
                Our advanced algorithms analyze thousands of options to craft your personalized itinerary.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Enjoy Your Journey</h3>
              <p className="text-gray-600">
                Get your complete itinerary with maps, bookings, and recommendations. Just pack and go!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Powered by Advanced Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform leverages cutting-edge AI, real-time data, and comprehensive safety features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">AI & Machine Learning</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Natural Language Processing for conversational trip planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Recommendation algorithms trained on millions of travel experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Real-time optimization based on weather, events, and local conditions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Predictive analytics for budget optimization and cost savings</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Safety & Security</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Multi-source location tracking (GPS, WiFi, Cellular, Bluetooth)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Emergency contact system with automatic alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Risk assessment and safety recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">End-to-end encryption for all personal data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Compass className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who trust AI Trip Planner to create their perfect journeys.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-trip">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Plan Your Trip Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About