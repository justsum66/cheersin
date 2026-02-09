import { Suspense } from 'react'
import HomePageClient from '@/components/home/HomePageClient'
import HomeTestimonialsCarousel from '@/components/home/HomeTestimonialsCarousel'
import HomeFAQServer from '@/components/home/HomeFAQServer'
import HomeTestimonialsSkeleton from '@/components/home/HomeTestimonialsSkeleton'
import HomeFAQSkeleton from '@/components/home/HomeFAQSkeleton'
import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'
import { HomePageJsonLd } from '@/components/home/HomePageJsonLd'

/** 首頁（marketing）：單一 Footer 合併至 HomePageClient，避免雙 footer；H98 JsonLd、P1-053 頁尾區 */
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
