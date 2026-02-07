import { Suspense } from 'react'
import HomePageClient from '@/components/home/HomePageClient'
import HomeTestimonialsCarousel from '@/components/home/HomeTestimonialsCarousel'
import HomeFAQServer from '@/components/home/HomeFAQServer'
import HomeTestimonialsSkeleton from '@/components/home/HomeTestimonialsSkeleton'
import HomeFAQSkeleton from '@/components/home/HomeFAQSkeleton'
import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'
import { HomePageJsonLd } from '@/components/home/HomePageJsonLd'

/** 首頁（marketing）：H98 首頁 JsonLd；Logo/Hero 優先渲染，Testimonials 輪播 5s/張+滑動，FAQ/其餘 Suspense 懶載入 */
export default async function HomePage() {
  return (
    <>
      <HomePageJsonLd />
      <HomePageClient
      testimonials={
        <ErrorBoundaryBlock blockName="精選評價">
          <Suspense fallback={<HomeTestimonialsSkeleton />}>
            <HomeTestimonialsCarousel />
          </Suspense>
        </ErrorBoundaryBlock>
      }
      faq={
        <ErrorBoundaryBlock blockName="常見問題">
          <Suspense fallback={<HomeFAQSkeleton />}>
            <HomeFAQServer />
          </Suspense>
        </ErrorBoundaryBlock>
      }
    />
    </>
  )
}
