import ContactBento from '@/components/ContactBento'
import SpotlightReveal from '@/components/SpotlightReveal'

export const metadata = { title: 'Contact — Hasaka' }

export default function ContactPage() {
  return (
    <div className="ctpg">
      <div className="absolute inset-0 z-0">
        <SpotlightReveal />
      </div>
      <div className="ctpg-inner">
        <ContactBento />
      </div>
    </div>
  )
}
