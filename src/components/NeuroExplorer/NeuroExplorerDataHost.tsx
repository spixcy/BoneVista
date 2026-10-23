import { useEffect, type PropsWithChildren } from 'react';
import { useGLTF } from '@react-three/drei';
import { NEURO_ASSETS, type NeuroManifest } from '../../data/neuroAtlas';
import { useAppStore } from '../../store/appStore';

interface BrainManifestSource {
  id: number;
  name: string;
  label: string;
  category: string;
  side: 'left' | 'right' | 'median';
  region: string;
  ta2?: string[];
  source?: string;
}

function normalizeBrainManifest(raw: { nodes: BrainManifestSource[]; categories: NeuroManifest['categories'] }): NeuroManifest {
  return {
    categories: raw.categories,
    structures: raw.nodes.map((node) => ({
      id: `neuro:brain:${node.id}`,
      sourceId: node.id,
      name: node.label,
      category: node.category,
      side: node.side === 'median' ? 'midline' : node.side,
      region: node.region,
      source: node.source,
      aliases: node.ta2 ?? [],
      meshNames: [node.name],
    })),
  };
}

export default function NeuroExplorerDataHost({ children }: PropsWithChildren) {
  const request = useAppStore((state) => state.neuroLoadRequest);
  const setManifests = useAppStore((state) => state.setNeuroManifests);
  const setStatus = useAppStore((state) => state.setNeuroStatus);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    useGLTF.clear(NEURO_ASSETS.brain);
    useGLTF.clear(NEURO_ASSETS.nerves);
    Promise.all([
      fetch(NEURO_ASSETS.brainManifest).then((response) => {
        if (!response.ok) throw new Error('Brain atlas metadata could not be loaded.');
        return response.json();
      }),
      fetch(NEURO_ASSETS.nervesManifest).then((response) => {
        if (!response.ok) throw new Error('Nerve atlas metadata could not be loaded.');
        return response.json();
      }),
    ]).then(([brainSource, nerves]) => {
      if (!active) return;
      setManifests(normalizeBrainManifest(brainSource), nerves as NeuroManifest);
    }).catch((error: unknown) => {
      if (active) setStatus('error', error instanceof Error ? error.message : 'Neuro atlas metadata could not be loaded.');
    });
    return () => { active = false; };
  }, [request, setManifests, setStatus]);

  return children;
}
