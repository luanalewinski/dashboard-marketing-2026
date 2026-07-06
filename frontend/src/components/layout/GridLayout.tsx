import React from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CardConfig, useLayoutEditor } from './useLayoutEditor';
import SortableCard from './SortableCard';
import LayoutToolbar from './LayoutToolbar';

interface Props {
  pageId: string;
  cards: CardConfig[];
  /** Map from card id to the JSX to render inside that card */
  renderCard: (id: string) => React.ReactNode;
  gap?: number;
}

export default function GridLayout({ pageId, cards, renderCard, gap = 14 }: Props) {
  const layout = useLayoutEditor(pageId, cards);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      layout.reorder(String(active.id), String(over.id));
    }
  }

  const hiddenWithLabels = layout.hiddenCards.map(c => ({
    id: c.id,
    label: cards.find(cfg => cfg.id === c.id)?.label ?? c.id,
  }));

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={layout.visibleCards.map(c => c.id)} strategy={rectSortingStrategy}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap,
          }}>
            {layout.visibleCards.map(card => (
              <SortableCard
                key={card.id}
                id={card.id}
                colSpan={card.colSpan}
                editMode={layout.editMode}
                onHide={() => layout.toggleHidden(card.id)}
                onResize={span => layout.setSpan(card.id, span)}
              >
                {renderCard(card.id)}
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <LayoutToolbar
        editMode={layout.editMode}
        hiddenCount={layout.hiddenCards.length}
        hiddenLabels={hiddenWithLabels as { id: string; label: string }[]}
        onEnter={layout.enterEdit}
        onSave={layout.saveEdit}
        onCancel={layout.cancelEdit}
        onReset={layout.resetLayout}
        onRestore={layout.toggleHidden}
      />

      {/* Edit mode hint banner */}
      {layout.editMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 190,
          height: 3, background: 'linear-gradient(90deg, #3D7BFF, #4ADE80, #FBBF24)',
          animation: 'shimmer 2s linear infinite',
          backgroundSize: '200% 100%',
        }} />
      )}
    </>
  );
}

// Convenience re-export for pages that need to use void activeDragId
export { useLayoutEditor } from './useLayoutEditor';
export type { CardConfig } from './useLayoutEditor';
