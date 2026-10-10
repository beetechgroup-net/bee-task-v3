import { Navbar } from "./components/landing/Navbar"
import { Hero } from "./components/landing/Hero"
import { Stats } from "./components/landing/Stats"
import { Features } from "./components/landing/Features"
import { FeatureTabs } from "./components/landing/FeatureTabs"
import { Workflow } from "./components/landing/Workflow"
import { Testimonials } from "./components/landing/Testimonials"
import { Faq } from "./components/landing/Faq"
import { CtaSection } from "./components/landing/CtaSection"
import { Footer } from "./components/landing/Footer"

export function App() {
  return (
    <div className="min-h-screen bg-app-bg text-text-main font-sans selection:bg-brand-soft selection:text-brand flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <FeatureTabs />
        <Workflow />
        <Testimonials />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
