import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SPAN_OPTIONS = [
  { value: 3,  label: '¼' },
  { value: 4,  label: '⅓' },
  { value: 6,  label: '½' },
  { value: 8,  label: '⅔' },
  { value: 9,  label: '¾' },
  { value: 12, label: '■' },
];

interface Props {
  id: string;
  colSpan: number;
  editMode: boolean;
  onHide: () => void;
  onResize: (span: number) => void;
  children: React.ReactNode;
}

export default function SortableCard({ id, colSpan, editMode, onHide, onResize, children }: Props) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id, disabled: !editMode });

  const style: React.CSSProperties = {
    gridColumn: `span ${colSpan}`,
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.45 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {editMode && (
        <>
          {/* Edit overlay border */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 20,
            border: '2px dashed rgba(61,123,255,.4)',
            pointerEvents: 'none', zIndex: 10,
            background: 'rgba(61,123,255,.03)',
          }} />

          {/* Drag handle — top-left */}
          <div
            {...attributes}
            {...listeners}
            style={{
              position: 'absolute', top: 8, left: 8, zIndex: 20,
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(61,123,255,.18)', border: '1px solid rgba(61,123,255,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'grab', color: '#3D7BFF',
            }}
            title="Arrastar"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="4" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/>
              <circle cx="4" cy="6" r="1.2"/><circle cx="8" cy="6" r="1.2"/>
              <circle cx="4" cy="10" r="1.2"/><circle cx="8" cy="10" r="1.2"/>
            </svg>
          </div>

          {/* Controls — top-right */}
          <div style={{
            position: 'absolute', top: 8, right: 8, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {/* Span selector */}
            {SPAN_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onResize(opt.value)}
                title={`${opt.value}/12 colunas`}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  border: `1px solid ${colSpan === opt.value ? '#3D7BFF' : 'rgba(255,255,255,.1)'}`,
                  background: colSpan === opt.value ? 'rgba(61,123,255,.25)' : 'rgba(255,255,255,.05)',
                  color: colSpan === opt.value ? '#3D7BFF' : 'rgba(238,242,248,.4)',
                  fontSize: '.65rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {opt.label}
              </button>
            ))}

            {/* Hide button */}
            <button
              onClick={onHide}
              title="Ocultar card"
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: '1px solid rgba(255,107,107,.25)',
                background: 'rgba(255,107,107,.08)',
                color: '#FF6B6B', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </>
      )}

      {children}
    </div>
  );
}
