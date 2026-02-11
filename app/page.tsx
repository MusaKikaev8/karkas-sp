import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { ShowcaseDemo } from "@/components/landing/showcase-demo";
import { BentoGrid } from "@/components/landing/bento-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Comparison } from "@/components/landing/comparison";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <ShowcaseDemo />
      <BentoGrid />
      <HowItWorks />
      <Comparison />
      
      {/* Coming soon sections */}
      <div className="opacity-50 pointer-events-none">
        <Pricing />
      </div>
      <div className="opacity-50 pointer-events-none">
        <Testimonials />
      </div>
      <div className="opacity-50 pointer-events-none">
        <FAQ />
      </div>
      
      <CTA />
      <Footer />
    </main>
  );
}
