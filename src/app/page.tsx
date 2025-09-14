"use client";

import API from "../../apilist";
import { CallToAction } from "@/components/CallToAction";
import CustomerReviews from "@/components/CustomerReviews";
import { FAQSection } from "@/components/FAQSection";
import Hero from "@/components/hero";
import { HowItWorks } from "@/components/HowItWorks";
import LatestTrades from "@/components/LatestTrades";
import ReservesList from "@/components/ReservesList";
import { WhyChooseUs } from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <div className='min-h-screen'>
      <Hero />
      <LatestTrades />

      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 lg:flex-row pt-10'>
        <div className='flex-1'>
          <ReservesList fetchUrl={API.url("reserves")} refreshMs={45000} />
        </div>
        <div className='w-full lg:w-1/3'>
          <CustomerReviews />
        </div>
      </div>

      <WhyChooseUs />
      <FAQSection />
      <HowItWorks />
      <CallToAction />
    </div>
  );
}
