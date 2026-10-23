import MuscleExplorerPanel from './MuscleExplorerPanel';
import { useMuscleExplorerModel } from '../../hooks/useMuscleExplorerModel';

/** Bridges Antigravity's presentation panel to BoneVista's shared anatomy state. */
export default function MuscleExplorerHost() {
  const model = useMuscleExplorerModel();
  return <section data-testid="muscle-explorer-host" aria-label="Muscle Explorer workspace">
    <MuscleExplorerPanel {...model} />
  </section>;
}
