'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from './CaseBuilder.module.css'
import CaseStudyModal from './CaseStudyModal'
import type { CaseStudy, JournalPost, Section, ContentItem, ContentType } from '@/lib/cases'

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)

const TABS: { type: ContentType; label: string }[] = [
  { type: 'work', label: 'Work' },
  { type: 'case', label: 'Cases' },
  { type: 'journal', label: 'Journal' },
]

const blankCase = (type: 'work' | 'case'): CaseStudy => ({
  type, slug: '', title: '', client: '', category: '', tab: type === 'work' ? 'Branding' : '',
  year: '', accent: '#1a1a1a', cover: '', intro: '', services: [], sections: [],
})

const blankJournal = (): JournalPost => ({
  type: 'journal', slug: '', title: '', excerpt: '', category: '', author: '', date: '',
  cover: '', size: 'md', featured: false, body: '',
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

const isJournal = (d: ContentItem): d is JournalPost => (d as JournalPost).type === 'journal'

// R2 folder per content type
const folderFor = (t: ContentType): string => (t === 'case' ? 'cases' : t)

export default function CaseBuilder() {
  const [activeType, setActiveType] = useState<ContentType>('work')
  const [list, setList] = useState<{ slug: string; title: string }[]>([])
  const [draft, setDraft] = useState<ContentItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const loadList = useCallback((type: ContentType) =>
    fetch(`/api/cases?type=${type}`)
      .then((r) => r.json())
      .then((d: { items?: ContentItem[] }) => setList((d.items ?? []).map((c) => ({ slug: c.slug, title: c.title })))), [])

  useEffect(() => { loadList(activeType) }, [activeType, loadList])

  const switchType = (type: ContentType) => {
    setActiveType(type); setDraft(null); setIsNew(false); setMsg('')
  }

  const selectItem = async (slug: string) => {
    const c = await fetch(`/api/cases/${slug}`).then((r) => r.json())
    setDraft(c); setIsNew(false); setMsg('')
  }

  const startNew = () => {
    setDraft(activeType === 'journal' ? blankJournal() : blankCase(activeType))
    setIsNew(true); setMsg('')
  }

  /* ── mutation ── */
  const set = (patch: Partial<ContentItem>) => setDraft((d) => (d ? ({ ...d, ...patch } as ContentItem) : d))

  const patchSection = (id: string, patch: Partial<Section>) =>
    setDraft((d) => d && !isJournal(d) ? { ...d, sections: d.sections.map((s) => s.id === id ? ({ ...s, ...patch } as Section) : s) } : d)
  const addSection = (type: Section['type']) =>
    setDraft((d) => d && !isJournal(d) ? { ...d, sections: [...d.sections, newSection(type)] } : d)
  const removeSection = (id: string) =>
    setDraft((d) => d && !isJournal(d) ? { ...d, sections: d.sections.filter((s) => s.id !== id) } : d)
  const moveSection = (id: string, dir: -1 | 1) =>
    setDraft((d) => {
      if (!d || isJournal(d)) return d
      const i = d.sections.findIndex((s) => s.id === id); const j = i + dir
      if (i < 0 || j < 0 || j >= d.sections.length) return d
      const next = [...d.sections]; [next[i], next[j]] = [next[j], next[i]]
      return { ...d, sections: next }
    })

  /* ── save / delete ── */
  const save = async (): Promise<boolean> => {
    if (!draft) return false
    if (!draft.slug || !draft.title) { setMsg('Slug and title are required.'); return false }
    const res = isNew
      ? await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
      : await fetch(`/api/cases/${draft.slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      const reason = d.error || `HTTP ${res.status}`
      setMsg('Save failed')
      alert(`Save failed: ${reason}`)
      return false
    }
    setMsg('Saved ✓'); setIsNew(false); await loadList(activeType); return true
  }

  const remove = async () => {
    if (!draft || isNew) return
    if (!confirm(`Delete "${draft.title}"?`)) return
    await fetch(`/api/cases/${draft.slug}`, { method: 'DELETE' })
    setDraft(null); await loadList(activeType)
  }

  const setSlug = (v: string) => set({ slug: v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '') })

  return (
    <div className={styles.wrap}>
      {/* ── Sidebar ── */}
      <aside className={styles.side}>
        <div className={styles.typeTabs}>
          {TABS.map((t) => (
            <button key={t.type} className={`${styles.typeTab} ${activeType === t.type ? styles.typeActive : ''}`} onClick={() => switchType(t.type)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.sideHd}>
          <h2>{TABS.find((t) => t.type === activeType)?.label}</h2>
          <button className={styles.newBtn} onClick={startNew}>+ New</button>
        </div>
        <ul className={styles.list}>
          {list.map((c) => (
            <li key={c.slug}>
              <button className={`${styles.listItem} ${draft?.slug === c.slug && !isNew ? styles.active : ''}`} onClick={() => selectItem(c.slug)}>
                <span>{c.title}</span><small>/{c.slug}</small>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className={styles.empty}>Nothing here yet.</li>}
        </ul>
      </aside>

      {/* ── Editor ── */}
      <main className={styles.editor}>
        {!draft && <div className={styles.placeholder}>Select an item or create a new one →</div>}

        {draft && (
          <>
            <div className={styles.toolbar}>
              <h1>{isNew ? `New ${activeType}` : draft.title || draft.slug}</h1>
              <div className={styles.actions}>
                {msg && <span className={styles.msg}>{msg}</span>}
                {!isJournal(draft) && (
                  <button className={styles.ghost} onClick={async () => { if (await save()) setPreview(draft.slug) }}>Save &amp; Preview</button>
                )}
                <button className={styles.primary} onClick={save}>Save</button>
                {!isNew && <button className={styles.danger} onClick={remove}>Delete</button>}
              </div>
            </div>

            {isJournal(draft)
              ? <JournalEditor draft={draft} set={set} isNew={isNew} setSlug={setSlug} folder="journal" />
              : (
                <CaseEditor
                  draft={draft} set={set} isNew={isNew} setSlug={setSlug} activeType={activeType} folder={folderFor(activeType)}
                  patchSection={patchSection} addSection={addSection} removeSection={removeSection} moveSection={moveSection}
                />
              )}
          </>
        )}
      </main>

      <CaseStudyModal slug={preview} onClose={() => setPreview(null)} />
    </div>
  )
}

/* ─────────────────────────────────────────── CASE / WORK editor ── */
function CaseEditor({
  draft, set, isNew, setSlug, activeType, folder, patchSection, addSection, removeSection, moveSection,
}: {
  draft: CaseStudy; set: (p: Partial<CaseStudy>) => void; isNew: boolean; setSlug: (v: string) => void; activeType: ContentType; folder: string
  patchSection: (id: string, p: Partial<Section>) => void; addSection: (t: Section['type']) => void
  removeSection: (id: string) => void; moveSection: (id: string, d: -1 | 1) => void
}) {
  return (
    <>
      <section className={styles.card}>
        <div className={styles.grid2}>
          <label>Title<input value={draft.title} onChange={(e) => set({ title: e.target.value })} /></label>
          <label>Slug<input value={draft.slug} disabled={!isNew} placeholder="kebab-case" onChange={(e) => setSlug(e.target.value)} /></label>
          <label>Client<input value={draft.client ?? ''} onChange={(e) => set({ client: e.target.value })} /></label>
          <label>Category<input value={draft.category ?? ''} onChange={(e) => set({ category: e.target.value })} /></label>
          {activeType === 'work' && (
            <label>Tab
              <select value={draft.tab ?? 'Branding'} onChange={(e) => set({ tab: e.target.value })}>
                <option>Branding</option><option>Web</option><option>Content</option>
              </select>
            </label>
          )}
          <label>Year<input value={draft.year ?? ''} onChange={(e) => set({ year: e.target.value })} /></label>
          <label>Accent (hero colour)<input type="color" value={draft.accent ?? '#1a1a1a'} onChange={(e) => set({ accent: e.target.value })} /></label>
          <label>Services (comma separated)<input value={(draft.services ?? []).join(', ')} onChange={(e) => set({ services: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></label>
        </div>
        <ImageField label="Cover image (optional)" value={draft.cover ?? ''} onChange={(v) => set({ cover: v })} folder={folder} />
        <label className={styles.full}>Intro<textarea rows={3} value={draft.intro ?? ''} onChange={(e) => set({ intro: e.target.value })} /></label>
      </section>

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
          <SectionEditor section={s} patch={(p) => patchSection(s.id, p)} folder={folder} />
        </section>
      ))}

      <div className={styles.addBar}>
        {(['text', 'image', 'video', 'columns', 'grid'] as Section['type'][]).map((t) => (
          <button key={t} onClick={() => addSection(t)}>+ {t}</button>
        ))}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────── JOURNAL editor ── */
function JournalEditor({ draft, set, isNew, setSlug, folder }: {
  draft: JournalPost; set: (p: Partial<JournalPost>) => void; isNew: boolean; setSlug: (v: string) => void; folder: string
}) {
  return (
    <section className={styles.card}>
      <div className={styles.grid2}>
        <label>Title<input value={draft.title} onChange={(e) => set({ title: e.target.value })} /></label>
        <label>Slug<input value={draft.slug} disabled={!isNew} placeholder="kebab-case" onChange={(e) => setSlug(e.target.value)} /></label>
        <label>Category<input value={draft.category ?? ''} placeholder="Essay / Interview…" onChange={(e) => set({ category: e.target.value })} /></label>
        <label>Author<input value={draft.author ?? ''} onChange={(e) => set({ author: e.target.value })} /></label>
        <label>Date<input value={draft.date ?? ''} placeholder="2026-05-12" onChange={(e) => set({ date: e.target.value })} /></label>
        <label>Size
          <select value={draft.size ?? 'md'} onChange={(e) => set({ size: e.target.value as JournalPost['size'] })}>
            <option value="lg">Large (with image)</option>
            <option value="md">Medium (with image)</option>
            <option value="sm">Small (text only)</option>
          </select>
        </label>
        <label className={styles.inline}><input type="checkbox" checked={!!draft.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured (homepage)</label>
      </div>
      <ImageField label="Cover image" value={draft.cover ?? ''} onChange={(v) => set({ cover: v })} folder={folder} />
      <label className={styles.full}>Excerpt<textarea rows={2} value={draft.excerpt ?? ''} onChange={(e) => set({ excerpt: e.target.value })} /></label>
      <label className={styles.full}>Body (one paragraph per line)<textarea rows={8} value={draft.body ?? ''} onChange={(e) => set({ body: e.target.value })} /></label>
    </section>
  )
}

/* ─────────────────────────────────────────── Section editor ── */
function SectionEditor({ section, patch, folder }: { section: Section; patch: (p: Partial<Section>) => void; folder: string }) {
  if (section.type === 'text') {
    return (
      <div className={styles.fields}>
        <label>Eyebrow<input value={section.eyebrow ?? ''} onChange={(e) => patch({ eyebrow: e.target.value })} /></label>
        <label>Heading<input value={section.heading ?? ''} onChange={(e) => patch({ heading: e.target.value })} /></label>
        <label>Body<textarea rows={3} value={section.body ?? ''} onChange={(e) => patch({ body: e.target.value })} /></label>
        <label className={styles.inline}><input type="checkbox" checked={section.align === 'center'} onChange={(e) => patch({ align: e.target.checked ? 'center' : 'left' })} /> Center</label>
      </div>
    )
  }
  if (section.type === 'image' || section.type === 'video') {
    return (
      <div className={styles.fields}>
        <ImageField label="Source" value={section.src} onChange={(v) => patch({ src: v })} folder={folder} accept={section.type === 'video' ? 'video/*' : 'image/*'} />
        {section.type === 'image'
          ? <label>Caption<input value={section.caption ?? ''} onChange={(e) => patch({ caption: e.target.value })} /></label>
          : <ImageField label="Poster" value={section.poster ?? ''} onChange={(v) => patch({ poster: v })} folder={folder} />}
        <label className={styles.inline}><input type="checkbox" checked={!!section.full} onChange={(e) => patch({ full: e.target.checked })} /> Full-bleed</label>
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
  const items = section.items
  return (
    <div className={styles.fields}>
      <label>Columns<input type="number" min={1} max={4} value={section.columns ?? 2} onChange={(e) => patch({ columns: Number(e.target.value) })} /></label>
      {items.map((it, i) => (
        <div key={i} className={styles.subRow}>
          <ImageFieldInline value={it.src} onChange={(v) => patch({ items: items.map((x, j) => j === i ? { ...x, src: v } : x) })} folder={folder} />
          <input placeholder="Caption" value={it.caption ?? ''} onChange={(e) => patch({ items: items.map((x, j) => j === i ? { ...x, caption: e.target.value } : x) })} />
          <button className={styles.x} onClick={() => patch({ items: items.filter((_, j) => j !== i) })}>✕</button>
        </div>
      ))}
      <button className={styles.addSub} onClick={() => patch({ items: [...items, { src: '', caption: '' }] })}>+ image</button>
    </div>
  )
}

/* ─────────────────────────────────────────── Image upload field ── */
function useUpload(folder: string) {
  const [busy, setBusy] = useState(false)
  const upload = async (file: File): Promise<string | null> => {
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(d.error || `Upload failed (${res.status})`)
        return null
      }
      return d.url ?? null
    } catch {
      alert('Upload failed: network error')
      return null
    } finally {
      setBusy(false)
    }
  }
  return { busy, upload }
}

function ImageField({ label, value, onChange, folder, accept = 'image/*' }: { label: string; value: string; onChange: (v: string) => void; folder: string; accept?: string }) {
  const { busy, upload } = useUpload(folder)
  return (
    <label className={styles.full}>{label}
      <div className={styles.uploadRow}>
        <input value={value} placeholder="/path.jpg or paste a URL" onChange={(e) => onChange(e.target.value)} />
        <label className={styles.uploadBtn}>
          {busy ? '…' : 'Upload'}
          <input type="file" accept={accept} hidden onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return
            const url = await upload(f); if (url) onChange(url)
            e.target.value = ''
          }} />
        </label>
      </div>
      {value && <div className={styles.thumbPrev} style={{ backgroundImage: `url(${value})` }} />}
    </label>
  )
}

function ImageFieldInline({ value, onChange, folder }: { value: string; onChange: (v: string) => void; folder: string }) {
  const { busy, upload } = useUpload(folder)
  return (
    <div className={styles.uploadRow} style={{ flex: 1 }}>
      <input placeholder="Image URL" value={value} onChange={(e) => onChange(e.target.value)} />
      <label className={styles.uploadBtn}>
        {busy ? '…' : 'Upload'}
        <input type="file" accept="image/*" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return
          const url = await upload(f); if (url) onChange(url)
          e.target.value = ''
        }} />
      </label>
    </div>
  )
}
