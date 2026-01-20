'use client';

import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="flex flex-col gap-12 py-8">
          {/* Hero Section */}
          <HeroSection />

          {/* Featured Products */}
          <Suspense fallback={<ProductsSkeleton />}>
            <FeaturedProducts />
          </Suspense>

          {/* Categories */}
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesGrid />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="container mx-auto px-4">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="container mx-auto px-4">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
