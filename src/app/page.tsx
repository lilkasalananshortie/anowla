import NoiseOverlay from "@/components/editorial-landing/NoiseOverlay";
import EditorialNavbar from "@/components/editorial-landing/EditorialNavbar";
import EditorialHero from "@/components/editorial-landing/EditorialHero";
import EditorialFeatureGrid from "@/components/editorial-landing/EditorialFeatureGrid";
import EditorialMethod from "@/components/editorial-landing/EditorialMethod";
import EditorialFooter from "@/components/editorial-landing/EditorialFooter";

export default function Home() {
  return (
    <main className="font-sans bg-[#ccd5ae] text-[#01472e] min-h-screen relative selection:bg-[#01472e] selection:text-[#fefae0]">
      {/* 1. Fixed SVG Fractal Noise Overlay (0.04 opacity across viewport) */}
      <NoiseOverlay />

      {/* 2. Fixed Top Navigation (Hyphen logo, pill blur nav, white pill counter) */}
      <EditorialNavbar dueCount={4} />

      {/* 3. Hero Section (23vw Anton Display, Staggered letters, Floating organic cards, Parallax) */}
      <EditorialHero />

      {/* 4. Product / Feature Grid (Olive bg, 5rem radius, 15vw Anton, 3-col [4/5] cards, Blur-reveal button) */}
      <EditorialFeatureGrid />

      {/* 5. Editorial Method Section (Cream bg, 5rem radius, SM-2 protocol showcase) */}
      <EditorialMethod />

      {/* 6. Footer (Forest bg, Sage text, 5rem radius, 12-col grid, Underline-only input) */}
      <EditorialFooter />
    </main>
  );
}
