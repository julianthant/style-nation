'use client'

import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

interface CTACard {
  title: string
  description: string
  backgroundImage: string
  backgroundColor: string
  onGetStarted: () => void
}

interface CTASectionsProps {
  onBuyCarClick?: () => void
  onSellCarClick?: () => void
}

function CTACard({ title, description, backgroundImage, backgroundColor, onGetStarted }: CTACard) {
  return (
    <div
      className="relative h-[394px] rounded-2xl overflow-hidden flex flex-col justify-center p-8 lg:p-20"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundColor,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10">
        <h2 className="text-white text-[30px] font-bold leading-[45px] mb-4">
          {title}
        </h2>
        <p className="text-white text-[15px] leading-[27.75px] mb-8 max-w-[355px]">
          {description}
        </p>
        <Button 
          onClick={onGetStarted}
          className="bg-white text-[#050B20] hover:bg-white/90 border border-white rounded-xl px-6 py-4 h-[60px] text-[15px] font-medium inline-flex items-center gap-2"
        >
          Get Started
          <ArrowUpRight className="w-[14px] h-[14px]" />
        </Button>
      </div>
    </div>
  )
}

export function CTASections({ onBuyCarClick, onSellCarClick }: CTASectionsProps) {
  const handleBuyCarClick = () => {
    onBuyCarClick?.()
  }

  const handleSellCarClick = () => {
    onSellCarClick?.()
  }

  const ctaCards: CTACard[] = [
    {
      title: 'Are You Looking\nFor a Car ?',
      description: 'We are committed to providing our customers with exceptional service.',
      backgroundImage: 'https://api.builder.io/api/v1/image/assets/TEMP/dd6d90354178972d7b1dc3d029c54a9108c46918?width=1370',
      backgroundColor: '#E9F2FF',
      onGetStarted: handleBuyCarClick,
    },
    {
      title: 'Do You Want to\nSell a Car ?',
      description: 'We are committed to providing our customers with exceptional service.',
      backgroundImage: 'https://api.builder.io/api/v1/image/assets/TEMP/caa95c1449a96939ebcd22976634c9d91fe60e71?width=1370',
      backgroundColor: '#FFE9F3',
      onGetStarted: handleSellCarClick,
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ctaCards.map((card, index) => (
            <CTACard
              key={index}
              title={card.title}
              description={card.description}
              backgroundImage={card.backgroundImage}
              backgroundColor={card.backgroundColor}
              onGetStarted={card.onGetStarted}
            />
          ))}
        </div>
      </div>
    </section>
  )
}