'use client'

import { useEffect, useState } from 'react'
import styles from './CaseBuilder.module.css'
import CaseStudyModal from './CaseStudyModal'
import type { CaseStudy, Section } from '@/lib/cases'

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)

const blank = (): CaseStudy => ({
  slug: '',
  title: '',
  client: '',
  category: '',
  year: '',
  accent: '#1a1a1a',
  cover: '',
  intro: '',
  services: [],
  sections: [],
})

function newSection(type: Section['type']): Section {
  const id = uid()
  switch (type) {
    case 'text': return { id, type, eyebrow: '', heading: '', body: '', align: 'left' }
    case 'image': return { id, type, src: '', caption: '', full: false }
    case 'video': return { id, type, src: '', poster: '', full: false }
    case 'columns': return { id, type, items: [{ heading: '', body: '' }, { heading: '', body: '' }] }
    case 'grid': return { id, type, columns: 2, items: [{ src: '', caption: '' }] }
  }
}

export default function CaseBuilder() {
  const [list, setList] = useState<{ slug: string; title: string }[]>([])
  const [draft, setDraft] = useState<CaseStudy | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const loadList = () =>
    fetch('/api/cases').then((r) => r.json()).then((d) => setList(d.cases.map((c: CaseStudy) => ({ slug: c.slug, title: c.title }))))

  useEffect(() => { loadList() }, [])

  const selectCase = async (slug: string) => {
    const c = await fetch(`/api/cases/${slug}`).then((r) => r.json())
    setDraft(c)
    setIsNew(false)
    setMsg('')
  }

  const startNew = () => { setDraft(blank()); setIsNew(true); setMsg('') }

  /* ── field + section mutation ── */
  const set = (patch: Partial<CaseStudy>) => setDraft((d) => (d ? { ...d, ...patch } : d))

  const patchSection = (id: string, patch: Partial<Section>) =>
    setDraft((d) => d ? { ...d, sections: d.sections.map((s) => s.id === id ? ({ ...s, ...patch } as Section) : s) } : d)

  const addSection = (type: Section['type']) =>
    setDraft((d) => d ? { ...d, sections: [...d.sections, newSection(type)] } : d)

  const removeSection = (id: string) =>
    setDraft((d) => d ? { ...d, sections: d.sections.filter((s) => s.id !== id) } : d)

  const moveSection = (id: string, dir: -1 | 1) =>
    setDraft((d) => {
      if (!d) return d
      const i = d.sections.findIndex((s) => s.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= d.sections.length) return d
      const next = [...d.sections]
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...d, sections: next }
    })

  /* ── save / delete ── */
  const save = async (): Promise<boolean> => {
    if (!draft) return false
    if (!draft.slug || !draft.title) { setMsg('Slug and title are required.'); return false }
    const res = isNew
      ? await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
      : await fetch(`/api/cases/${draft.slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    if (!res.ok) { setMsg('Save failed.'); return false }
    setMsg('Saved ✓')
    setIsNew(false)
    await loadList()
    return true
  }

  const remove = async () => {
    if (!draft || isNew) return
    if (!confirm(`Delete "${draft.title}"?`)) return
    await fetch(`/api/cases/${draft.slug}`, { method: 'DELETE' })
    setDraft(null)
    await loadList()
  }

  return (
    <div className={styles.wrap}>
      {/* ── Sidebar: case list ── */}
      <aside className={styles.side}>
        <div className={styles.sideHd}>
          <h2>Cases</h2>
          <button className={styles.newBtn} onClick={startNew}>+ New</button>
        </div>
        <ul className={styles.list}>
          {list.map((c) => (
            <li key={c.slug}>
              <button
                className={`${styles.listItem} ${draft?.slug === c.slug && !isNew ? styles.active : ''}`}
                onClick={() => selectCase(c.slug)}
              >
                <span>{c.title}</span>
                <small>/{c.slug}</small>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className={styles.empty}>No cases yet.</li>}
        </ul>
      </aside>

      {/* ── Editor ── */}
      <main className={styles.editor}>
        {!draft && <div className={styles.placeholder}>Select a case or create a new one →</div>}

        {draft && (
          <>
            <div className={styles.toolbar}>
              <h1>{isNew ? 'New case' : draft.title || draft.slug}</h1>
              <div className={styles.actions}>
                {msg && <span className={styles.msg}>{msg}</span>}
                <button className={styles.ghost} onClick={async () => { if (await save()) setPreview(draft.slug) }}>Save &amp; Preview</button>
                <button className={styles.primary} onClick={save}>Save</button>
                {!isNew && <button className={styles.danger} onClick={remove}>Delete</button>}
              </div>
            </div>

            {/* meta fields */}
            <section className={styles.card}>
              <div className={styles.grid2}>
                <label>Title<input value={draft.title} onChange={(e) => set({ title: e.target.value })} /></label>
                <label>Slug<input value={draft.slug} disabled={!isNew} placeholder="kebab-case" onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} /></label>
                <label>Client<input value={draft.client ?? ''} onChange={(e) => set({ client: e.target.value })} /></label>
                <label>Category<input value={draft.category ?? ''} onChange={(e) => set({ category: e.target.value })} /></label>
                <label>Year<input value={draft.year ?? ''} onChange={(e) => set({ year: e.target.value })} /></label>
                <label>Accent (hero colour)<input type="color" value={draft.accent ?? '#1a1a1a'} onChange={(e) => set({ accent: e.target.value })} /></label>
                <label>Cover image/video URL<input value={draft.cover ?? ''} placeholder="/cover.jpg (optional)" onChange={(e) => set({ cover: e.target.value })} /></label>
                <label>Services (comma separated)<input value={(draft.services ?? []).join(', ')} onChange={(e) => set({ services: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></label>
              </div>
              <label className={styles.full}>Intro<textarea rows={3} value={draft.intro ?? ''} onChange={(e) => set({ intro: e.target.value })} /></label>
            </section>

            {/* sections */}
            <h3 className={styles.sectionsHd}>Sections</h3>
            {draft.sections.map((s, i) => (
              <section key={s.id} className={styles.card}>
                <div className={styles.secHd}>
                  <span className={styles.secType}>{s.type}</span>
                  <div className={styles.secCtrls}>
                    <button onClick={() => moveSection(s.id, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                    <button onClick={() => moveSection(s.id, 1)} disabled={i === draft.sections.length - 1} aria-label="Move down">↓</button>
                    <button className={styles.x} onClick={() => removeSection(s.id)} aria-label="Remove">✕</button>
                  </div>
                </div>
                <SectionEditor section={s} patch={(p) => patchSection(s.id, p)} />
              </section>
            ))}

            {/* add section bar */}
            <div className={styles.addBar}>
              {(['text', 'image', 'video', 'columns', 'grid'] as Section['type'][]).map((t) => (
                <button key={t} onClick={() => addSection(t)}>+ {t}</button>
              ))}
            </div>
          </>
        )}
      </main>

      <CaseStudyModal slug={preview} onClose={() => setPreview(null)} />
    </div>
  )
}

/* ── Per-type section editor ── */
function SectionEditor({ section, patch }: { section: Section; patch: (p: Partial<Section>) => void }) {
  if (section.type === 'text') {
    return (
      <div className={styles.fields}>
        <label>Eyebrow<input value={section.eyebrow ?? ''} onChange={(e) => patch({ eyebrow: e.target.value })} /></label>
        <label>Heading<input value={section.heading ?? ''} onChange={(e) => patch({ heading: e.target.value })} /></label>
        <label>Body<textarea rows={3} value={section.body ?? ''} onChange={(e) => patch({ body: e.target.value })} /></label>
        <label className={styles.inline}>
          <input type="checkbox" checked={section.align === 'center'} onChange={(e) => patch({ align: e.target.checked ? 'center' : 'left' })} /> Center
        </label>
      </div>
    )
  }
  if (section.type === 'image' || section.type === 'video') {
    return (
      <div className={styles.fields}>
        <label>Source URL<input value={section.src} placeholder="/image.jpg or /videos/clip.mp4" onChange={(e) => patch({ src: e.target.value })} /></label>
        {section.type === 'image'
          ? <label>Caption<input value={section.caption ?? ''} onChange={(e) => patch({ caption: e.target.value })} /></label>
          : <label>Poster URL<input value={section.poster ?? ''} onChange={(e) => patch({ poster: e.target.value })} /></label>}
        <label className={styles.inline}>
          <input type="checkbox" checked={!!section.full} onChange={(e) => patch({ full: e.target.checked })} /> Full-bleed
        </label>
      </div>
    )
  }
  if (section.type === 'columns') {
    const items = section.items
    return (
      <div className={styles.fields}>
        {items.map((it, i) => (
          <div key={i} className={styles.subRow}>
            <input placeholder="Heading" value={it.heading ?? ''} onChange={(e) => patch({ items: items.map((x, j) => j === i ? { ...x, heading: e.target.value } : x) })} />
            <textarea placeholder="Body" rows={2} value={it.body ?? ''} onChange={(e) => patch({ items: items.map((x, j) => j === i ? { ...x, body: e.target.value } : x) })} />
            <button className={styles.x} onClick={() => patch({ items: items.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <button className={styles.addSub} onClick={() => patch({ items: [...items, { heading: '', body: '' }] })}>+ column</button>
      </div>
    )
  }
  // grid
  const items = section.items
  return (
    <div className={styles.fields}>
      <label>Columns<input type="number" min={1} max={4} value={section.columns ?? 2} onChange={(e) => patch({ columns: Number(e.target.value) })} /></label>
      {items.map((it, i) => (
        <div key={i} className={styles.subRow}>
          <input placeholder="Image URL" value={it.src} onChange={(e) => patch({ items: items.map((x, j) => j === i ? { ...x, src: e.target.value } : x) })} />
          <input placeholder="Caption" value={it.caption ?? ''} onChange={(e) => patch({ items: items.map((x, j) => j === i ? { ...x, caption: e.target.value } : x) })} />
          <button className={styles.x} onClick={() => patch({ items: items.filter((_, j) => j !== i) })}>✕</button>
        </div>
      ))}
      <button className={styles.addSub} onClick={() => patch({ items: [...items, { src: '', caption: '' }] })}>+ image</button>
    </div>
  )
}
