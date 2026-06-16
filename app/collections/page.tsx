export const metadata = { title: 'Collections — Hasaka' }

const collections = [
  {
    palette: 'cb1',
    by: 'Hasaka · Creative Director™',
    title: 'Jury\'s Pick',
    titleColor: '#1a3d1a',
    badge: <div style={{background:'rgba(0,0,0,0.08)',borderRadius:8,padding:'8px 12px',fontSize:10,color:'#2d5a1e',fontWeight:700,alignSelf:'flex-start'}}>AWARD 2025</div>,
    desc: 'Projects nominated for brand excellence awards and recognition.',
  },
  {
    palette: 'cb2',
    by: 'Hasaka · Creative Director™',
    title: 'Brand-deep',
    badge: <div style={{height:40,background:'rgba(255,255,255,0.1)',borderRadius:8}}></div>,
    desc: 'Projects that made an impact with branded content and strategy.',
  },
  {
    palette: 'cb3',
    by: 'Hasaka · Creative Director™',
    title: 'Dopamine',
    badge: <div style={{width:64,height:64,borderRadius:'50%',background:'radial-gradient(circle,#c084fc,#e84393,transparent)',margin:'0 auto',opacity:0.8}}></div>,
    desc: 'Projects giving that glow-up energy through bold color and form.',
  },
  {
    palette: 'cb4',
    by: 'Hasaka · Creative Director™',
    title: 'The Third Dimension',
    badge: <div style={{width:64,height:64,borderRadius:'50%',background:'radial-gradient(circle at 35% 35%,#a8e6cf,#2d7a4a)',margin:'0 auto',boxShadow:'inset -5px -5px 14px rgba(0,0,0,0.3)'}}></div>,
    desc: 'Projects utilizing 3D and spatial design to bring a fresh perspective.',
  },
  {
    palette: 'cb5',
    by: 'Hasaka · Creative Director™',
    title: 'Rooted',
    badge: null,
    desc: 'Projects grounded in cultural identity and heritage brand building.',
  },
  {
    palette: 'cb6',
    by: 'Hasaka · Creative Director™',
    title: 'Bold Moves',
    badge: null,
    desc: 'Projects where we took the biggest creative risks — and they paid off.',
  },
]

export default function CollectionsPage() {
  return (
    <div className="pi">
      <div className="phd">
        <h1>Collections</h1>
      </div>
      <div className="cgrid">
        {collections.map((c) => (
          <div key={c.title} className="ccard">
            <div className={`cthumb ${c.palette}`}>
              <div>
                <div className="cby">{c.by}</div>
                <div className="ctit" style={c.titleColor ? { color: c.titleColor } : undefined}>{c.title}</div>
              </div>
              {c.badge}
            </div>
            <div className="cdesc">{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
