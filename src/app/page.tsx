import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import HowItWorks from "@/components/landing/HowItWorks";
import ClinicalFeatures from "@/components/landing/ClinicalFeatures";
import ClinicalManifesto from "@/components/landing/ClinicalManifesto";
import ClinicalSafety from "@/components/landing/ClinicalSafety";
import StudyPerks from "@/components/landing/StudyPerks";
import About from "@/components/landing/About";
import Contact from "@/components/landing/Contact";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import FAQChatBubble from "@/components/landing/FAQChatBubble";
import Reveal from "@/components/landing/Reveal";

export default function Home() {
  return (
    <main className="font-sans bg-[#fefaf3] text-[#19251a] min-h-screen">
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <ClinicalFeatures />
      <ClinicalManifesto />
      <Reveal>
        <ClinicalSafety />
      </Reveal>
      <StudyPerks />
      <About />
      <Contact />
      <Reveal>
        <FinalCTA />
      </Reveal>
      <Footer />
      <FAQChatBubble />
    </main>
  );
}
