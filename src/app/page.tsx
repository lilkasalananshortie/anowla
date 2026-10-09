import EditorialNavbar from "@/components/editorial-landing/EditorialNavbar";
import EditorialHero from "@/components/editorial-landing/EditorialHero";
import EditorialFeatureGrid from "@/components/editorial-landing/EditorialFeatureGrid";
import EditorialMethod from "@/components/editorial-landing/EditorialMethod";
import EditorialFooter from "@/components/editorial-landing/EditorialFooter";

export default function Home() {
  return (
    <main className="font-sans bg-[#fbfbfa] text-[#121316] min-h-screen relative selection:bg-blue-600 selection:text-white">
      {/* 1. Fixed Top Navigation */}
      <EditorialNavbar dueCount={4} />

      {/* 2. Hero Section */}
      <EditorialHero />

      {/* 3. Product / Curriculum Feature Grid */}
      <EditorialFeatureGrid />

      {/* 4. Active Retrieval Method Section */}
      <EditorialMethod />

      {/* 5. Minimalist Footer */}
      <EditorialFooter />
    </main>
  );
}
