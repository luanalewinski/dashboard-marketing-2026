import { useState, useEffect, useCallback } from 'react';

export interface CardConfig {
  id: string;
  label: string;
  defaultColSpan: number;
}

export interface CardState {
  id: string;
  colSpan: number;
  hidden: boolean;
}

export interface LayoutStore {
  order: string[];
  spans: Record<string, number>;
  hidden: string[];
}

function getDefault(cards: CardConfig[]): LayoutStore {
  return {
    order: cards.map(c => c.id),
    spans: Object.fromEntries(cards.map(c => [c.id, c.defaultColSpan])),
    hidden: [],
  };
}

function load(pageId: string, cards: CardConfig[]): LayoutStore {
  try {
    const raw = localStorage.getItem(`nova-layout-${pageId}`);
    if (!raw) return getDefault(cards);
    const stored: Partial<LayoutStore> = JSON.parse(raw);
    const defaultLayout = getDefault(cards);
    // Merge: add any new cards that don't exist in stored layout
    const knownIds = new Set(stored.order ?? []);
    const newCards = cards.filter(c => !knownIds.has(c.id));
    return {
      order: [...(stored.order ?? defaultLayout.order), ...newCards.map(c => c.id)],
      spans: { ...defaultLayout.spans, ...(stored.spans ?? {}) },
      hidden: stored.hidden ?? [],
    };
  } catch {
    return getDefault(cards);
  }
}

function save(pageId: string, layout: LayoutStore) {
  try {
    localStorage.setItem(`nova-layout-${pageId}`, JSON.stringify(layout));
  } catch {}
}

export function useLayoutEditor(pageId: string, cards: CardConfig[]) {
  const [editMode, setEditMode]   = useState(false);
  const [layout, setLayout]       = useState<LayoutStore>(() => load(pageId, cards));
  // Snapshot for cancel
  const [snapshot, setSnapshot]   = useState<LayoutStore | null>(null);

  useEffect(() => { save(pageId, layout); }, [pageId, layout]);

  const enterEdit = useCallback(() => {
    setSnapshot(JSON.parse(JSON.stringify(layout)));
    setEditMode(true);
  }, [layout]);

  const saveEdit = useCallback(() => {
    setSnapshot(null);
    setEditMode(false);
  }, []);

  const cancelEdit = useCallback(() => {
    if (snapshot) setLayout(snapshot);
    setSnapshot(null);
    setEditMode(false);
  }, [snapshot]);

  const resetLayout = useCallback(() => {
    setLayout(getDefault(cards));
  }, [cards]);

  const reorder = useCallback((activeId: string, overId: string) => {
    setLayout(prev => {
      const order = [...prev.order];
      const from  = order.indexOf(activeId);
      const to    = order.indexOf(overId);
      if (from === -1 || to === -1 || from === to) return prev;
      order.splice(from, 1);
      order.splice(to, 0, activeId);
      return { ...prev, order };
    });
  }, []);

  const setSpan = useCallback((id: string, colSpan: number) => {
    setLayout(prev => ({ ...prev, spans: { ...prev.spans, [id]: colSpan } }));
  }, []);

  const toggleHidden = useCallback((id: string) => {
    setLayout(prev => ({
      ...prev,
      hidden: prev.hidden.includes(id)
        ? prev.hidden.filter(h => h !== id)
        : [...prev.hidden, id],
    }));
  }, []);

  // Build ordered visible + hidden card states
  const allCards: CardState[] = layout.order.map(id => ({
    id,
    colSpan: layout.spans[id] ?? cards.find(c => c.id === id)?.defaultColSpan ?? 6,
    hidden: layout.hidden.includes(id),
  }));

  const visibleCards  = allCards.filter(c => !c.hidden);
  const hiddenCards   = allCards.filter(c => c.hidden);

  return {
    editMode,
    enterEdit,
    saveEdit,
    cancelEdit,
    resetLayout,
    reorder,
    setSpan,
    toggleHidden,
    visibleCards,
    hiddenCards,
    layout,
  };
}
