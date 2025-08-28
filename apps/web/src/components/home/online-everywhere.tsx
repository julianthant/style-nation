'use client'

import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

interface OnlineEverywhereSectionProps {
  onGetStarted?: () => void
}

export function OnlineEverywhereSection({ onGetStarted }: OnlineEverywhereSectionProps) {
  const handleGetStarted = () => {
    onGetStarted?.()
  }

  return (
    <section className="bg-[#050B20] py-0">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[696px]">
          {/* Left Image */}
          <div className="relative h-[400px] lg:h-[696px]">
            <Image
              src="https://api.builder.io/api/v1/image/assets/TEMP/8e3c4fb690e9642a5b7f3b8957a7864e4fad6502?width=1552"
              alt="Silver SUV car showcasing our online service"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-0">
            <div className="max-w-[580px]">
              <h2 className="text-white text-[32px] lg:text-[40px] font-bold leading-[44px] lg:leading-[56px] mb-6">
                Online, in-person,
                <br />
                everywhere
              </h2>
              <p className="text-white text-[15px] leading-[27.75px] mb-8 max-w-[572px]">
                Choose from thousands of vehicles from multiple brands and buy
                online with Click & Drive, or visit us at one of our
                dealerships today.
              </p>
              <Button
                variant="outline"
                onClick={handleGetStarted}
                className="border-white text-white hover:bg-white hover:text-[#050B20] rounded-xl px-6 py-4 h-[53px] text-[15px] font-medium inline-flex items-center gap-2 bg-transparent transition-colors"
              >
                Get Started
                <ArrowUpRight className="w-[14px] h-[14px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}