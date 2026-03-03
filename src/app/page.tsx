import { Header } from '@/components/Header'
import { ResultsGallery } from '@/components/ResultsGallery'
import { Calculator } from '@/components/Calculator'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050508]">
      <Header />
      <ResultsGallery images={[
        '/campaign-results/jan-campaign-results.png',
        '/campaign-results/campaign-martin.png',
        '/campaign-results/instantly-campaigns.png',
        '/campaign-results/coaching-offer.png',
        '/campaign-results/marketing-agency-offer.png',
        '/campaign-results/marketing-agency.png',
        '/campaign-results/offer-for-recruitment-industry.png',
        '/campaign-results/saas-signup-trial-offer.png',
        '/campaign-results/tech-setup-offer-for-startups.png',
        '/campaign-results/paid-events-tickets-offer.png',
      ]} />
      <main>
        <Calculator />
      </main>
    </div>
  )
}
