import { create } from 'zustand';
import type { MemeProject, TextOverlay, Sticker, MemeFilters, MemeTemplate } from '@/types';
import { generateId, deepClone } from '@/lib/utils';

interface EditorState {
  // State
  project: MemeProject;
  selectedTextId: string | null;
  selectedStickerId: string | null;
  isExporting: boolean;
  history: MemeProject[];
  historyIndex: number;

  // Actions
  setImage: (imageUri: string) => void;
  clearProject: () => void;

  // Text actions
  addText: (text?: string) => string;
  updateText: (id: string, updates: Partial<TextOverlay>) => void;
  removeText: (id: string) => void;
  selectText: (id: string | null) => void;

  // Sticker actions
  addSticker: (imageUrl: string) => string;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  selectSticker: (id: string | null) => void;

  // Filter actions
  updateFilters: (filters: Partial<MemeFilters>) => void;
  resetFilters: () => void;

  // Template actions
  setTemplate: (template: MemeTemplate | null) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Export
  setExporting: (isExporting: boolean) => void;
}

const defaultFilters: MemeFilters = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
};

const defaultProject: MemeProject = {
  id: generateId(),
  imageUri: null,
  textOverlays: [],
  stickers: [],
  filters: { ...defaultFilters },
  template: null,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  project: { ...defaultProject },
  selectedTextId: null,
  selectedStickerId: null,
  isExporting: false,
  history: [],
  historyIndex: -1,

  setImage: (imageUri) => {
    set((state) => ({
      project: {
        ...state.project,
        imageUri,
        id: generateId(),
      },
      selectedTextId: null,
      selectedStickerId: null,
      history: [],
      historyIndex: -1,
    }));
    get().saveToHistory();
  },

  clearProject: () => {
    set({
      project: { ...defaultProject, id: generateId() },
      selectedTextId: null,
      selectedStickerId: null,
      history: [],
      historyIndex: -1,
    });
  },

  addText: (text = 'TAP TO EDIT') => {
    const id = generateId();
    const newText: TextOverlay = {
      id,
      text,
      x: 0.5, // Center (percentage)
      y: 0.1, // Near top
      fontSize: 48,
      fontFamily: 'Impact',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 2,
      rotation: 0,
      scale: 1,
    };

    set((state) => ({
      project: {
        ...state.project,
        textOverlays: [...state.project.textOverlays, newText],
      },
      selectedTextId: id,
      selectedStickerId: null,
    }));

    get().saveToHistory();
    return id;
  },

  updateText: (id, updates) => {
    set((state) => ({
      project: {
        ...state.project,
        textOverlays: state.project.textOverlays.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      },
    }));
  },

  removeText: (id) => {
    set((state) => ({
      project: {
        ...state.project,
        textOverlays: state.project.textOverlays.filter((t) => t.id !== id),
      },
      selectedTextId: state.selectedTextId === id ? null : state.selectedTextId,
    }));
    get().saveToHistory();
  },

  selectText: (id) => {
    set({ selectedTextId: id, selectedStickerId: null });
  },

  addSticker: (imageUrl) => {
    const id = generateId();
    const newSticker: Sticker = {
      id,
      imageUrl,
      x: 0.5,
      y: 0.5,
      width: 100,
      height: 100,
      rotation: 0,
      scale: 1,
    };

    set((state) => ({
      project: {
        ...state.project,
        stickers: [...state.project.stickers, newSticker],
      },
      selectedStickerId: id,
      selectedTextId: null,
    }));

    get().saveToHistory();
    return id;
  },

  updateSticker: (id, updates) => {
    set((state) => ({
      project: {
        ...state.project,
        stickers: state.project.stickers.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      },
    }));
  },

  removeSticker: (id) => {
    set((state) => ({
      project: {
        ...state.project,
        stickers: state.project.stickers.filter((s) => s.id !== id),
      },
      selectedStickerId:
        state.selectedStickerId === id ? null : state.selectedStickerId,
    }));
    get().saveToHistory();
  },

  selectSticker: (id) => {
    set({ selectedStickerId: id, selectedTextId: null });
  },

  updateFilters: (filters) => {
    set((state) => ({
      project: {
        ...state.project,
        filters: { ...state.project.filters, ...filters },
      },
    }));
  },

  resetFilters: () => {
    set((state) => ({
      project: {
        ...state.project,
        filters: { ...defaultFilters },
      },
    }));
    get().saveToHistory();
  },

  setTemplate: (template) => {
    set((state) => ({
      project: {
        ...state.project,
        template,
        imageUri: template?.imageUrl || state.project.imageUri,
      },
    }));
    get().saveToHistory();
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        project: deepClone(history[newIndex]),
        historyIndex: newIndex,
        selectedTextId: null,
        selectedStickerId: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        project: deepClone(history[newIndex]),
        historyIndex: newIndex,
        selectedTextId: null,
        selectedStickerId: null,
      });
    }
  },

  saveToHistory: () => {
    const { project, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(deepClone(project));

    // Keep only last 20 states
    if (newHistory.length > 20) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setExporting: (isExporting) => set({ isExporting }),
}));
