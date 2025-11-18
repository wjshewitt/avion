import { create } from 'zustand';

export type ArtifactType = 'weather' | 'airport' | 'flights' | 'generic';

export interface ArtifactData {
  id: string; // usually toolCallId
  type: ArtifactType;
  title: string;
  data: any;
  toolName: string;
}

interface ArtifactState {
  isOpen: boolean;
  artifacts: ArtifactData[];
  activeArtifactId: string | null;
  
  openArtifact: (artifact: ArtifactData) => void;
  closeArtifact: (id: string) => void;
  closePanel: () => void;
  setActiveArtifact: (id: string) => void;
}

export const useArtifactStore = create<ArtifactState>((set, get) => ({
  isOpen: false,
  artifacts: [],
  activeArtifactId: null,

  openArtifact: (artifact) => {
    const { artifacts } = get();
    const exists = artifacts.find(a => a.id === artifact.id);
    
    if (exists) {
      set({ 
        isOpen: true, 
        activeArtifactId: artifact.id 
      });
    } else {
      set({ 
        isOpen: true, 
        artifacts: [...artifacts, artifact],
        activeArtifactId: artifact.id 
      });
    }
  },

  closeArtifact: (id) => {
    const { artifacts, activeArtifactId } = get();
    const newArtifacts = artifacts.filter(a => a.id !== id);
    
    // If we closed the active one, switch to the last one or null
    let newActiveId = activeArtifactId;
    if (activeArtifactId === id) {
      newActiveId = newArtifacts.length > 0 ? newArtifacts[newArtifacts.length - 1].id : null;
    }

    // If no artifacts left, close panel
    const isOpen = newArtifacts.length > 0;

    set({
      artifacts: newArtifacts,
      activeArtifactId: newActiveId,
      isOpen
    });
  },

  closePanel: () => set({ isOpen: false }),

  setActiveArtifact: (id) => set({ activeArtifactId: id }),
}));
