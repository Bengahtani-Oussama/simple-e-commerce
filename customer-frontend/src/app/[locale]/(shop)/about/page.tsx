"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  const t = useTranslations("about");

  return (
    <div className="flex flex-col items-center max-w-[1280px] mx-auto px-4 py-10">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {t("aboutUs.title") || "About Us"}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          {t("aboutUs.description") ||
            "Welcome to our e-commerce platform, where we strive to provide the best shopping experience with a wide range of high-quality products and exceptional customer service."}
        </p>
      </div>

      {/* What We Offer Section */}
      <div className="w-full mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t("aboutUs.offerings.title") || "What We Offer"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {t("aboutUs.offerings.wideRange.title") || "Wide Range of Products"}
            </h3>
            <p className="text-gray-600">
              {t("aboutUs.offerings.wideRange.description") ||
                "Discover thousands of products across various categories, from electronics to fashion, all curated for quality and value."}
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {t("aboutUs.offerings.quality.title") || "Quality Assurance"}
            </h3>
            <p className="text-gray-600">
              {t("aboutUs.offerings.quality.description") ||
                "We ensure every product meets high standards, providing you with reliable and durable items for your everyday needs."}
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {t("aboutUs.offerings.prices.title") || "Competitive Prices"}
            </h3>
            <p className="text-gray-600">
              {t("aboutUs.offerings.prices.description") ||
                "Enjoy great deals and discounts on our products, making shopping affordable and accessible for everyone."}
            </p>
          </div>
        </div>
      </div>

      {/* Our Services Section */}
      <div className="w-full mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t("aboutUs.services.title") || "Our Services"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {t("aboutUs.services.shipping.title") || "Fast & Secure Shipping"}
            </h3>
            <p className="text-gray-600">
              {t("aboutUs.services.shipping.description") ||
                "We offer fast, reliable shipping options to get your orders to you quickly and safely, with tracking available for peace of mind."}
            </p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {t("aboutUs.services.support.title") || "24/7 Customer Support"}
            </h3>
            <p className="text-gray-600">
              {t("aboutUs.services.support.description") ||
                "Our dedicated support team is available around the clock to assist with any questions, returns, or issues you may have."}
            </p>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">
          {t("aboutUs.socialMedia.title") || "Follow Us"}
        </h2>
        <div className="flex justify-center gap-4">
          <Link href="https://www.facebook.com/">
            <Button size="lg" variant="outline">
              <Facebook className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="https://www.instagram.com/">
            <Button size="lg" variant="outline">
              <Instagram className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="https://www.twitter.com/">
            <Button size="lg" variant="outline">
              <Twitter className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
