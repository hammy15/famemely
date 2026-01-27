import { create } from 'zustand';
import type { Caption } from '@/types';

// Default caption style presets
export const CAPTION_PRESETS = {
  top: { x: 50, y: 10 },
  middle: { x: 50, y: 50 },
  bottom: { x: 50, y: 90 },
} as const;

export const FONT_FAMILIES = [
  'Impact',
  'Arial Black',
  'Comic Sans MS',
  'Helvetica',
  'Times New Roman',
] as const;

export const CAPTION_COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#FF69B4', // Hot Pink
] as const;

interface CaptionState {
  // State
  photoUrl: string | null;
  captions: Caption[];
  selectedCaptionId: string | null;
  isDragging: boolean;

  // Actions
  setPhoto: (url: string) => void;
  clearPhoto: () => void;
  addCaption: (text?: string) => string;
  updateCaption: (id: string, updates: Partial<Caption>) => void;
  removeCaption: (id: string) => void;
  selectCaption: (id: string | null) => void;
  duplicateCaption: (id: string) => string | null;
  setDragging: (isDragging: boolean) => void;
  moveCaption: (id: string, x: number, y: number) => void;
  applyCaptionPreset: (id: string, preset: keyof typeof CAPTION_PRESETS) => void;
  clearAll: () => void;
  getCaptions: () => Caption[];
}

const generateCaptionId = () => `caption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createDefaultCaption = (text: string = 'Your text here'): Caption => ({
  id: generateCaptionId(),
  text,
  x: 50,
  y: 50,
  fontSize: 32,
  fontFamily: 'Impact',
  color: '#FFFFFF',
  rotation: 0,
  scale: 1,
  style: 'outline',
});

export const useCaptionStore = create<CaptionState>((set, get) => ({
  photoUrl: null,
  captions: [],
  selectedCaptionId: null,
  isDragging: false,

  setPhoto: (url) => {
    set({ photoUrl: url });
  },

  clearPhoto: () => {
    set({ photoUrl: null, captions: [], selectedCaptionId: null });
  },

  addCaption: (text) => {
    const newCaption = createDefaultCaption(text);
    set((state) => ({
      captions: [...state.captions, newCaption],
      selectedCaptionId: newCaption.id,
    }));
    return newCaption.id;
  },

  updateCaption: (id, updates) => {
    set((state) => ({
      captions: state.captions.map((caption) =>
        caption.id === id ? { ...caption, ...updates } : caption
      ),
    }));
  },

  removeCaption: (id) => {
    set((state) => ({
      captions: state.captions.filter((caption) => caption.id !== id),
      selectedCaptionId: state.selectedCaptionId === id ? null : state.selectedCaptionId,
    }));
  },

  selectCaption: (id) => {
    set({ selectedCaptionId: id });
  },

  duplicateCaption: (id) => {
    const { captions } = get();
    const original = captions.find((c) => c.id === id);
    if (!original) return null;

    const newCaption: Caption = {
      ...original,
      id: generateCaptionId(),
      x: Math.min(original.x + 5, 95),
      y: Math.min(original.y + 5, 95),
    };

    set((state) => ({
      captions: [...state.captions, newCaption],
      selectedCaptionId: newCaption.id,
    }));

    return newCaption.id;
  },

  setDragging: (isDragging) => {
    set({ isDragging });
  },

  moveCaption: (id, x, y) => {
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    set((state) => ({
      captions: state.captions.map((caption) =>
        caption.id === id ? { ...caption, x: clampedX, y: clampedY } : caption
      ),
    }));
  },

  applyCaptionPreset: (id, preset) => {
    const position = CAPTION_PRESETS[preset];
    set((state) => ({
      captions: state.captions.map((caption) =>
        caption.id === id ? { ...caption, ...position } : caption
      ),
    }));
  },

  clearAll: () => {
    set({ photoUrl: null, captions: [], selectedCaptionId: null, isDragging: false });
  },

  getCaptions: () => get().captions,
}));
