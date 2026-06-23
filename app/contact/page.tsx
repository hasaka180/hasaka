import ContactBento from '@/components/ContactBento'
import SpotlightReveal from '@/components/SpotlightReveal'

export const metadata = {
  title: 'Contact — Hasaka Wijenarayana',
  description: 'Get in touch with Hasaka — based in Dubai, available for brand projects worldwide.',
}

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
