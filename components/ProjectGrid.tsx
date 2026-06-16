'use client'

import { useState } from 'react'
import CaseStudyModal from './CaseStudyModal'

type Tab = 'Branding' | 'Web' | 'Content'

const projects = [
  {
    tab: 'Branding',
    slug: 'clef-des-champs',
    bg: 'linear-gradient(135deg,#d4fc79,#7bc67e)',
    titleText: 'CLEF DES\nCHAMPS',
    titleColor: '#1a3d1a',
    titleSize: 20,
    iconBg: '#2d7a3a',
    iconLetter: 'C',
    name: 'Clef des Champs',
    category: 'Food & Drink',
  },
  {
    tab: 'Branding',
    bg: 'linear-gradient(135deg,#3d1c02,#6b3621)',
    titleText: 'ditchfield',
    titleSize: 20,
    iconBg: '#6b3621',
    iconLetter: 'D',
    name: 'Ditchfield',
    category: 'Food & Drink',
  },
  {
    tab: 'Branding',
    bg: 'linear-gradient(135deg,#8b1a00,#3d0000)',
    titleText: 'CINEMA\nCINEMA',
    titleSize: 18,
    iconBg: '#111',
    iconColor: '#ffd93d',
    iconLetter: 'CC',
    name: 'Cinéma Cinéma',
    category: 'Entertainment',
  },
  {
    tab: 'Web',
    bg: 'linear-gradient(135deg,#0a0a0a,#2a2a2a)',
    titleText: 'SOViMAGE',
    titleSize: 18,
    iconBg: '#444',
    iconLetter: 'S',
    name: 'Sovimage',
    category: 'Entertainment',
  },
  {
    tab: 'Branding',
    bg: 'linear-gradient(135deg,#b8860b,#8b6914)',
    titleText: 'QUARTIER\nMOLSON',
    titleSize: 14,
    iconBg: '#b8860b',
    iconLetter: 'Q',
    name: 'Quartier Molson',
    category: 'Real Estate',
  },
  {
    tab: 'Branding',
    bg: 'linear-gradient(135deg,#6c5ce7,#a29bfe)',
    titleText: 'MAISON\nAUROE',
    titleSize: 20,
    iconBg: '#6c5ce7',
    iconLetter: 'M',
    name: 'Maison Aurore',
    category: 'Fashion',
  },
  {
    tab: 'Branding',
    slug: 'lumara-hotels',
    bg: 'linear-gradient(135deg,#1a1a3e,#3a2a6e)',
    titleText: 'Lumara',
    titleSize: 22,
    titleStyle: 'italic' as const,
    iconBg: '#2d7a3a',
    iconLetter: 'L',
    name: 'Lumara Hotels',
    category: 'Hospitality',
  },
  {
    tab: 'Web',
    bg: 'linear-gradient(135deg,#0d1117,#1a237e)',
    titleText: 'SOLUNA LABS',
    titleSize: 13,
    titleColor: '#00ff88',
    iconBg: '#0d1117',
    iconBorder: '1px solid #333',
    iconColor: '#00ff88',
    iconLetter: 'S',
    name: 'Soluna Labs',
    category: 'Tech Startup',
  },
]

export default function ProjectGrid() {
  const [activeTab, setActiveTab] = useState<Tab>('Branding')
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  const filtered = projects.filter((p) => p.tab === activeTab)

  return (
    <div>
      <div className="ftabs">
        {(['Branding', 'Web', 'Content'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`ftab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="pgrid2">
        {filtered.map((p) => (
          <div
            key={p.name}
            className="pc2"
            onClick={() => p.slug && setOpenSlug(p.slug)}
            style={{ cursor: p.slug ? 'pointer' : 'default' }}
          >
            <div className="pth2" style={{ background: p.bg }}>
              <div
                className="ptxt"
                style={{
                  fontSize: p.titleSize,
                  color: p.titleColor ?? '#fff',
                  fontStyle: p.titleStyle,
                }}
              >
                {p.titleText.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < p.titleText.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
            <div className="pme2">
              <div
                className="pio2"
                style={{
                  background: p.iconBg,
                  border: p.iconBorder,
                  color: p.iconColor ?? '#fff',
                }}
              >
                {p.iconLetter}
              </div>
              <div>
                <div className="pnm2">{p.name}</div>
                <div className="pct2">{p.category}</div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>
            No projects in this category yet.
          </div>
        )}
      </div>

      <CaseStudyModal slug={openSlug} onClose={() => setOpenSlug(null)} />
    </div>
  )
}
