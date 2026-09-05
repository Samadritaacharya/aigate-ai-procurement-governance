'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

const sections = [
  ['top', 'Overview'],
  ['screen', 'Screen'],
  ['evidence', 'Evidence'],
  ['value', 'Value'],
  ['method', 'Method'],
] as const;

export function ExperienceChrome() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.25 });
  const driftA = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-8%', '18%']);
  const driftB = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['10%', '-16%']);
  const [active, setActive] = useState('top');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-32% 0px -52% 0px', threshold: [0.1, 0.35, 0.65] },
    );
    sections.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
      <div className="cinematic-grid" aria-hidden="true" />
      <motion.div className="cinematic-orb orb-one" style={{ y: driftA }} aria-hidden="true" />
      <motion.div className="cinematic-orb orb-two" style={{ y: driftB }} aria-hidden="true" />
      <aside className="section-rail" aria-label="Page sections">
        {sections.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-label={`Jump to ${label}`}>
            <i />
            <span>{label}</span>
          </a>
        ))}
      </aside>
    </>
  );
}

export function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28, filter: 'blur(8px)' }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
