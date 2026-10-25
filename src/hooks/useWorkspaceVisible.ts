import { createContext, useContext } from 'react';

/** True while the embedded workspace is on screen; 3D scenes pause rendering when it is false. */
export const WorkspaceVisibleContext = createContext(true);

export const useWorkspaceVisible = () => useContext(WorkspaceVisibleContext);
