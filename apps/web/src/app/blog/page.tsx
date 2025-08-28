'use client'

import { MainHeader } from '@/components/layout/main-header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 Electric Cars for 2025",
      excerpt: "Discover the most innovative and efficient electric vehicles hitting the market this year.",
      category: "Electric Vehicles",
      date: "2025-01-15",
      author: "Sarah Johnson",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/e36ef571336e6a771b1279efe5feab78f166c833?width=600",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Car Buying Guide: New vs Used",
      excerpt: "Learn the pros and cons of buying new versus used vehicles to make the best decision for your budget.",
      category: "Buying Guide",
      date: "2025-01-12",
      author: "Michael Chen",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/f5b9c288cd441982faadecdcd5a360763316b5ef?width=600",
      readTime: "8 min read"
    },
    {
      id: 3,
      title: "Maintenance Tips for SUVs",
      excerpt: "Keep your SUV running smoothly with these essential maintenance tips and schedules.",
      category: "Maintenance",
      date: "2025-01-10",
      author: "David Rodriguez",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/217855260706994e452e3e53c5cffbca13b79f48?width=600",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Financing Options Explained",
      excerpt: "Understanding auto loans, leasing, and other financing options to get the best deal.",
      category: "Finance",
      date: "2025-01-08",
      author: "Jessica White",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/bd8a1b90faee712ca650c27b30cfac5543b9c1c8?width=600",
      readTime: "7 min read"
    },
    {
      id: 5,
      title: "Hybrid vs Gas: Which is Right for You?",
      excerpt: "Compare hybrid and gasoline vehicles to determine which technology suits your lifestyle.",
      category: "Comparison",
      date: "2025-01-05",
      author: "Robert Taylor",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/1f8dd9c2a3c331672370f4c7961c5d07a2bd0d3c?width=600",
      readTime: "4 min read"
    },
    {
      id: 6,
      title: "Safety Features Every Car Should Have",
      excerpt: "Essential safety technologies that should be on your checklist when car shopping.",
      category: "Safety",
      date: "2025-01-03",
      author: "Emma Davis",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/c91381d9d0b8d8db5e00989523eff091d8004418?width=600",
      readTime: "5 min read"
    }
  ]

  const categories = [
    "All Posts", "Electric Vehicles", "Buying Guide", "Maintenance", "Finance", "Comparison", "Safety"
  ]

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center max-w-[800px]">
          <h1 className="text-4xl font-bold mb-4">Car Insights & Tips</h1>
          <p className="text-lg text-muted-foreground">
            Stay informed with the latest automotive news, buying guides, and expert advice.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All Posts" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{post.readTime}</span>
                    <Button variant="ghost" size="sm" className="p-0 h-auto group-hover:text-primary">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center max-w-[600px]">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to our newsletter and never miss the latest automotive insights and tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-md border border-border bg-background"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}