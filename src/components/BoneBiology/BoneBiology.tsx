import React, { Suspense, lazy, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Move3d, Sparkles } from 'lucide-react';
import { KEY_NUMBERS, TOPICS, type TopicId } from './content';
import styles from './BoneBiology.module.css';

const BoneScenes = lazy(() => import('./BoneScenes'));

const FRACTURE_STAGES = ['Haematoma', 'Soft callus', 'Hard callus', 'Remodelling'];

/** Landing page section teaching bone biology with an interactive 3D model per topic. */
const BoneBiology: React.FC<{ eyebrowClassName: string; titleClassName: string }> = ({ eyebrowClassName, titleClassName }) => {
  const [topicId, setTopicId] = useState<TopicId>('structure');
  const [fractureStage, setFractureStage] = useState(0);
  const viewer = useRef<HTMLDivElement>(null);
  const near = useInView(viewer, { once: true, margin: '500px 0px' });
  const visible = useInView(viewer, { margin: '60px 0px' });
  const topic = TOPICS.find((t) => t.id === topicId)!;

  return (
    <section className={styles.section} id="bones" aria-labelledby="bones-title">
      <div className={styles.header}>
        <span className={eyebrowClassName}>02 · Bone biology</span>
        <h2 id="bones-title" className={titleClassName}>Bone biology, <em>in 3D.</em></h2>
        <p className={styles.lead}>A study companion for medical students. Pick a topic, rotate the model, and read the essentials alongside it — from cells and osteons to growth plates, fracture healing and the diseases that show up in exams.</p>
      </div>

      <dl className={styles.numbers}>
        {KEY_NUMBERS.map((item) => (
          <div key={item.value}><dt>{item.value}</dt><dd>{item.label}</dd></div>
        ))}
      </dl>

      <div className={styles.tabs} role="tablist" aria-label="Bone biology topics">
        {TOPICS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`bone-tab-${t.id}`}
            aria-selected={t.id === topicId}
            aria-controls="bone-panel"
            className={`${styles.tab} ${t.id === topicId ? styles.tabActive : ''}`}
            onClick={() => { setTopicId(t.id); setFractureStage(0); }}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>{t.tab}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <div ref={viewer} className={styles.viewer}>
          {near && (
            <Suspense fallback={<div className={styles.loading}>Loading 3D model…</div>}>
              <BoneScenes topic={topicId} fractureStage={fractureStage} active={visible} />
            </Suspense>
          )}
          <span className={styles.dragHint}><Move3d size={13} /> Drag to rotate</span>
          {topicId === 'fracture' && (
            <div className={styles.stages} role="group" aria-label="Fracture healing stage">
              {FRACTURE_STAGES.map((stage, i) => (
                <button key={stage} type="button" aria-pressed={fractureStage === i} className={fractureStage === i ? styles.stageActive : undefined} onClick={() => setFractureStage(i)}>
                  <b>{i + 1}</b>{stage}
                </button>
              ))}
            </div>
          )}
          <p className={styles.hint}>{topic.hint}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={topic.id}
            id="bone-panel"
            role="tabpanel"
            aria-labelledby={`bone-tab-${topic.id}`}
            className={styles.panel}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 0.8, 0.24, 1] }}
          >
            <h3>{topic.title}</h3>
            <p className={styles.intro}>{topic.intro}</p>
            <div className={styles.facts}>
              {topic.facts.map((fact) => (
                <div key={fact.title} className={styles.fact}>
                  <h4>{fact.title}</h4>
                  <p>{fact.text}</p>
                </div>
              ))}
            </div>
            <div className={styles.highYield}>
              <span><Sparkles size={13} /> High-yield</span>
              <ul>{topic.highYield.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <p className={styles.note}>Simplified teaching models, not to scale. Summaries are for revision; confirm details against your course texts.</p>
    </section>
  );
};

export default BoneBiology;
