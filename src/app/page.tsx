import { Header } from '@/components/Header'
import { ResultsGallery } from '@/components/ResultsGallery'
import { Calculator } from '@/components/Calculator'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050508]">
      <Header />
      <main>
        <Calculator />
      </main>
      <ResultsGallery />
    </div>
  )
}
