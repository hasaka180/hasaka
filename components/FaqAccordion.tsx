"use client";

import { useState } from 'react';
import styles from './FaqAccordion.module.css';

interface FaqItem { q: string; a: string }

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  if (!faqs.length) return null;

  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Frequently asked questions</h2>
      <div className={styles.list}>
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={`${styles.item} ${isOpen ? styles.active : ''}`}>
              <button
                className={styles.question}
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <span className={styles.icon}>{isOpen ? '−' : '+'}</span>
              </button>
              <div className={styles.answerWrap} style={{ maxHeight: isOpen ? '600px' : '0' }}>
                <div className={styles.answer}>{faq.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
