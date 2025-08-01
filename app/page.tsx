"use client";
import { HeroSection } from "@/components/hero-section";
import { Footer } from "@/components/footer";
// import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default function Home() {
  const clickHandler = () => {
    console.log("clicked");
  };
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Button onClick={clickHandler}>Blog Craft</Button> */}
      <Navbar user={null} />
      <HeroSection/>
      <Footer className="mt-auto"/>
    </div>
  );
}
