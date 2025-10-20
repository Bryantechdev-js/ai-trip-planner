
import Hero from "@/components/Hero";
import PublicTrips from "@/components/PublicTrips";
import { Button } from "@/components/ui/button";
// import { useUser } from "@clerk/nextjs";
import Image from "next/image";


export default function Home() {
  


  return (
    <>
    <Hero/>
    <div className="container mx-auto px-4 py-8">
      <PublicTrips />
    </div>
    </> 
  );
}
