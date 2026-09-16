import { Navbar } from "@/components/marketing/navbar";
import { HeroNew } from "@/components/marketing/hero-new";
import { Problem } from "@/components/marketing/problem";
import { See } from "@/components/marketing/see";
import { Find } from "@/components/marketing/find";
import { Understand } from "@/components/marketing/understand";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { RecommendationShowcase } from "@/components/marketing/recommendation";
import { DemoSection } from "@/components/marketing/demo";
import { Credibility } from "@/components/marketing/credibility";
import { Why } from "@/components/marketing/why";
import { FinalCTA } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Navbar />
      <HeroNew />
      <Problem />
      <See />
      <Find />
      <Understand />
      <HowItWorks />
      <RecommendationShowcase />
      <DemoSection />
      <Credibility />
      <Why />
      <FinalCTA />
      <Footer />
    </main>
  );
}
