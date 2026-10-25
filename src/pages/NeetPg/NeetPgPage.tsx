import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowLeft, Brain, Check, Pause, Play, Sparkles, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import NeuralNetworkCanvas from './NeuralNetworkCanvas';
import { NEET_TOPICS, type NeetTopic } from './content';
import { useAnimationTime } from './useAnimationTime';
import styles from './NeetPgPage.module.css';

export const NEET_HASH = '#/neet-pg';
const SPEEDS = [0.5, 1, 1.5];
const EASE = [0.22, 0.8, 0.24, 1] as const;

const topicFromHash = () => NEET_TOPICS.find((t) => window.location.hash === `${NEET_HASH}/${t.id}`)?.id ?? NEET_TOPICS[0].id;

/** Animated diagram with play/pause, speed control and clickable step captions. */
const Stage: React.FC<{ topic: NeetTopic }> = ({ topic }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '60px 0px' });
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [playing, setPlaying] = useState(!reduced);
  const [speed, setSpeed] = useState(1);
  const [offset, setOffset] = useState(0);
  const time = useAnimationTime(playing && inView, speed);
  const u = (((time + offset) / topic.period) % 1 + 1) % 1;
  const stepIndex = topic.steps.reduce((found, step, i) => (u >= step.at ? i : found), 0);
  const { Animation } = topic;

  const jumpTo = (at: number) => setOffset(at * topic.period - (time % topic.period) + 0.001);

  return (
    <div ref={ref} className={styles.stage}>
      <div className={styles.stageTop}>
        <span className={styles.live}><i /> {playing ? 'Live animation' : 'Paused'}</span>
        <div className={styles.playback}>
          <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause animation' : 'Play animation'}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          {SPEEDS.map((s) => (
            <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s}×</button>
          ))}
        </div>
      </div>
      <div className={styles.canvas}>
        <Animation u={u} />
      </div>
      <div className={styles.progress} aria-hidden="true"><span style={{ width: `${u * 100}%` }} /></div>
      <ol className={styles.steps}>
        {topic.steps.map((step, i) => (
          <li key={step.at}>
            <button type="button" aria-current={i === stepIndex} onClick={() => jumpTo(step.at)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {step.text}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

const Quiz: React.FC<{ topic: NeetTopic }> = ({ topic }) => {
  const [choice, setChoice] = useState<number | null>(null);
  const answered = choice !== null;
  return (
    <div className={styles.quiz}>
      <span className={styles.kicker}><Brain size={13} /> NEET PG practice</span>
      <p className={styles.question}>{topic.mcq.question}</p>
      <div className={styles.options}>
        {topic.mcq.options.map((option, i) => {
          const state = !answered ? '' : i === topic.mcq.answer ? styles.correct : i === choice ? styles.wrong : styles.faded;
          return (
            <button key={option} type="button" className={state} disabled={answered} onClick={() => setChoice(i)}>
              <b>{String.fromCharCode(65 + i)}</b>{option}
              {answered && i === topic.mcq.answer && <Check size={15} />}
              {answered && i === choice && i !== topic.mcq.answer && <X size={15} />}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.explanation}>
            <strong>{choice === topic.mcq.answer ? 'Correct.' : `Answer: ${String.fromCharCode(65 + topic.mcq.answer)}.`}</strong> {topic.mcq.explanation}
            <button type="button" onClick={() => setChoice(null)}>Try again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NeetPgPage: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const [topicId, setTopicId] = useState(topicFromHash);
  const topic = NEET_TOPICS.find((t) => t.id === topicId) ?? NEET_TOPICS[0];
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.title = 'NEET PG · Physiology in Motion — BoneVista';
    window.scrollTo(0, 0);
  }, [theme]);

  // Follow topic links such as #/neet-pg/synapse while the page is open.
  useEffect(() => {
    const onHash = () => setTopicId(topicFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Keep the active tab visible in the horizontally scrolling tab bar.
  useEffect(() => {
    const bar = tabsRef.current;
    const active = bar?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (bar && active) bar.scrollTo({ left: active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
  }, [topicId]);

  const choose = (id: string) => {
    setTopicId(id);
    window.history.replaceState(null, '', `${NEET_HASH}/${id}`);
    const top = tabsRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > 120) tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.back} href="#top"><ArrowLeft size={16} /> BoneVista</a>
        <div className={styles.brand}><span className={styles.brandMark}><Brain size={16} /></span><span>NEET PG <em>· Physiology in Motion</em></span></div>
        <a className={styles.headerLink} href="#/bone-explorer">Bone Explorer</a>
      </header>

      <section className={styles.hero}>
        <NeuralNetworkCanvas className={styles.network} />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <motion.span className={styles.eyebrow} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
            <Sparkles size={13} /> For NEET PG · INI-CET · USMLE revision
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: EASE }}>
            Watch physiology <em>happen.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: EASE }}>
            Neurons wiring together, action potentials racing along axons, vesicles spilling transmitter, sarcomeres sliding and the heart&apos;s electrical relay — six high-yield topics, each as a live, step-by-step motion graphic with exam pearls and a practice MCQ.
          </motion.p>
          <motion.div className={styles.heroStats} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.45 }}>
            <span><b>6</b> animated topics</span><span><b>{NEET_TOPICS.reduce((n, t) => n + t.steps.length, 0)}</b> narrated steps</span><span><b>{NEET_TOPICS.reduce((n, t) => n + t.highYield.length, 0)}</b> high-yield facts</span>
          </motion.div>
        </div>
      </section>

      <div ref={tabsRef} className={styles.tabs} role="tablist" aria-label="Topics">
        {NEET_TOPICS.map((t, i) => (
          <button key={t.id} type="button" role="tab" aria-selected={t.id === topic.id} className={t.id === topic.id ? styles.tabActive : styles.tab} onClick={() => choose(t.id)}>
            <span>{String(i + 1).padStart(2, '0')}</span>{t.tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.main
          key={topic.id}
          className={styles.layout}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Stage topic={topic} />
          <aside className={styles.notes}>
            <span className={styles.kicker}>{topic.system}</span>
            <h2>{topic.title}</h2>
            <p className={styles.intro}>{topic.intro}</p>
            <div className={styles.highYield}>
              <span className={styles.kicker}><Sparkles size={13} /> High-yield for NEET PG</span>
              <ul>{topic.highYield.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <Quiz key={topic.id} topic={topic} />
          </aside>
        </motion.main>
      </AnimatePresence>

      <footer className={styles.footer}>
        Simplified teaching animations, not to scale. Values are typical textbook figures; always confirm with your standard references (Guyton, Ganong) before exams.
      </footer>
    </div>
  );
};

export default NeetPgPage;
