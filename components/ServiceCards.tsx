import styles from "./ServiceCards.module.css";

const services = [
  {
    num: "01",
    name: "Brand Identity",
    desc: "Building memorable identities that stand out and stand for something.",
    icon: "⊕",
    img: "/Brand-Identity.jpg",
  },
  {
    num: "02",
    name: "Brand Strategy",
    desc: "Defining clear positioning and strategies that drive relevance and growth.",
    icon: "⊙",
    img: "/brand-strategy.jpg",
  },
  {
    num: "03",
    name: "Creative Direction",
    desc: "Crafting compelling concepts and visual directions that capture attention.",
    icon: "◎",
    img: "/creative-direction.jpg",
  },
  {
    num: "04",
    name: "Rebranding",
    desc: "Refreshing brands to match their evolution and future goals.",
    icon: "↺",
    img: "/rebranding.jpg",
  },
  {
    num: "05",
    name: "Design Systems",
    desc: "Creating scalable design systems that ensure consistency and efficiency.",
    icon: "⊞",
    img: "/design-system.jpg",
  },
  {
    num: "06",
    name: "AI Brand Systems",
    desc: "Leveraging AI to build intelligent systems that elevate brand performance.",
    icon: "✦",
    img: "/AI.jpg",
  },
  {
    num: "07",
    name: "Visual Storytelling",
    desc: "Art-directed imagery and storytelling that creates emotional connections.",
    icon: "⬚",
    img: "/Storytelling.jpg",
  },
  {
    num: "08",
    name: "Motion & Multimedia",
    desc: "Bringing brands to life through motion, animation, and immersive content.",
    icon: "▷",
    img: "/motion.jpg",
  },
  {
    num: "09",
    name: "Digital Experiences",
    desc: "Designing seamless digital experiences that engage and convert.",
    icon: "▱",
    img: "/Digital.jpg",
  },
]

export default function ServiceCards() {
  return (
    <div className="sgrid">
      {services.map((s) => (
        <div key={s.name} className={`sc ${styles.card}`}>

          {/* Background image */}
          <img src={s.img} alt={s.name} className={styles.cardBg} />

          {/* Default card content */}
          <div className={`sc-top ${styles.cardContent}`}>
            <span className={styles.cardNum}>{s.num}</span>
            <span className={styles.cardIcon}>{s.icon}</span>
          </div>
          <div className={`sc-body ${styles.cardContent}`}>
            <h3 className={styles.cardTitle}>{s.name}</h3>
            <p className={styles.cardDesc}>{s.desc}</p>
          </div>
          <div className={`sc-foot ${styles.cardContent}`}>
            <span className={styles.cardArrow}>→</span>
          </div>

          {/* Hover overlay — white frosted cloud */}
          <div className={styles.cardHover}>
            <div className={styles.cardHoverTop}>
              <span className={styles.cardHoverNum}>{s.num}</span>
              <span className={styles.cardHoverIcon}>{s.icon}</span>
            </div>
            <div className={styles.cardHoverBody}>
              <h3 className={styles.cardHoverTitle}>{s.name}</h3>
              <p className={styles.cardHoverDesc}>{s.desc}</p>
            </div>
            <div className={styles.cardHoverFoot}>
              <span className={styles.readMore}>Read more →</span>
            </div>
          </div>

        </div>
      ))}
    </div>
  )
}
