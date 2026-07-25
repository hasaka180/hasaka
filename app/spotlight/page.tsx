import SpotlightReveal from '@/components/SpotlightReveal'

export const metadata = {
  title: 'Spotlight — Hasaka Sasaranga',
  description: 'A visual spotlight on selected creative work by Hasaka Sasaranga.',
  alternates: { canonical: '/spotlight' },
}

export default function SpotlightPage() {
  return <SpotlightReveal />
}
