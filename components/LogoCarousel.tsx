import styles from './LogoCarousel.module.css';

interface Brand { name: string; img: string }

// Drop your PNGs into /public/logos/ and update the img paths here
const ROW_1: Brand[] = [
  { name: 'LUMARA', img: '/logos/abcaptial.png' },
  { name: 'NORDE', img: '/logos/ambitionmentors.png' },
  { name: 'VERDÉ', img: '/logos/archihq.png' },
  { name: 'NEXERA', img: '/logos/capitalcreators.png' },
  { name: 'REALPHA', img: '/logos/competence.png' },
  { name: 'KAIJU', img: '/logos/crafted.png' },
  { name: 'STEGGYS', img: '/logos/cristaldry.png' },
  { name: 'MAZYON', img: '/logos/ds2dio.png' },
  { name: 'CARDO', img: '/logos/emc.png' },
  { name: 'SCOUTX', img: '/logos/eqwitty.png' },
  { name: 'RIIXO', img: '/logos/ferroic.png' },
  { name: 'GATHR', img: '/logos/harpyia.png' },
  { name: 'ROCKYPET', img: '/logos/naamche.png' },
  { name: 'OSOS', img: '/logos/ngled.png' },
  { name: 'SADARA', img: '/logos/nova.png' },
];

const ROW_2: Brand[] = [
  { name: 'Brand 16', img: '/logos/nuva.png' },
  { name: 'Brand 17', img: '/logos/ojetur.png' },
  { name: 'Brand 18', img: '/logos/planville.png' },
  { name: 'Brand 19', img: '/logos/prentus.png' },
  { name: 'Brand 20', img: '/logos/radwave.png' },
  { name: 'Brand 21', img: '/logos/sadara.png' },
  { name: 'Brand 22', img: '/logos/sequoya.png' },
  { name: 'Brand 23', img: '/logos/smileboutique.png' },
  { name: 'Brand 24', img: '/logos/somoturismo.png' },
  { name: 'Brand 25', img: '/logos/spinexpert.png' },
  { name: 'Brand 26', img: '/logos/storworks.png' },
  { name: 'Brand 27', img: '/logos/summaforte.png' },
  { name: 'Brand 28', img: '/logos/tantivy.png' },
  { name: 'Brand 29', img: '/logos/therockypet.png' },
  { name: 'Brand 30', img: '/logos/tminus.png' },
];

function LogoCard({ brand }: { brand: Brand }) {
  return (
    <div className={styles.card}>
      <img
        src={brand.img}
        alt={brand.name}
        className={styles.logoImg}
      />
    </div>
  );
}

function MarqueeRow({ brands, direction }: { brands: Brand[]; direction: 'right' | 'left' }) {
  const doubled = [...brands, ...brands];
  return (
    <div className={direction === 'right' ? styles.trackRight : styles.trackLeft}>
      <div className={styles.row}>
        {doubled.map((b, i) => <LogoCard key={i} brand={b} />)}
      </div>
    </div>
  );
}

export default function LogoCarousel() {
  return (
    <section className={styles.section}>
      <p className={styles.eyebrow}>Trusted by brands across 20+ industries</p>
      <div className={styles.trackWrap}>
        <MarqueeRow brands={ROW_1} direction="right" />
        <MarqueeRow brands={ROW_2} direction="left" />
      </div>
    </section>
  );
}
