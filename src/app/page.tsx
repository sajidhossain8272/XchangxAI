import Hero from "@/components/hero";
import LatestTrades from "@/components/LatestTrades";

export default function Home() {
  return (
    <div className='min-h-screen'>
      <Hero />
      <LatestTrades />
    </div>
  );
}
