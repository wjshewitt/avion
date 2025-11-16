'use client';

import { X, Check } from 'lucide-react';
import { MAP_STYLES, type MapStyleType } from './mapStyles';

interface MapStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: MapStyleType;
  onStyleChange: (style: MapStyleType) => void;
}

export function MapStyleModal({
  isOpen,
  onClose,
  currentStyle,
  onStyleChange,
}: MapStyleModalProps) {
  if (!isOpen) return null;

  const handleStyleSelect = (styleId: MapStyleType) => {
    onStyleChange(styleId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div
          className="bg-card border border-border shadow-2xl overflow-hidden"
          style={{
            borderRadius: '2px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Map Style
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
                Select Display Type
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors"
              style={{ borderRadius: '2px' }}
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          {/* Style Options */}
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {MAP_STYLES.map((style) => {
              const isSelected = style.id === currentStyle;

              return (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={`
                    w-full p-4 border transition-all duration-200 text-left
                    ${
                      isSelected
                        ? 'border-2 bg-accent'
                        : 'border hover:border-muted-foreground hover:bg-accent/50'
                    }
                  `}
                  style={{
                    borderRadius: '2px',
                    borderColor: isSelected ? 'var(--primary)' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {style.name}
                        </span>
                        {isSelected && (
                          <Check
                            size={16}
                            className="text-foreground"
                            style={{ color: 'var(--primary)' }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {style.description}
                      </p>
                    </div>

                    {/* Preview thumbnail */}
                    <div
                      className="w-16 h-12 border border-border flex-shrink-0"
                      style={{
                        borderRadius: '2px',
                        background:
                          style.id === 'dark'
                            ? '#1A1A1A'
                            : style.id === 'light'
                            ? '#F4F4F4'
                            : style.id === 'satellite'
                            ? 'linear-gradient(135deg, #2a5c3f 0%, #4a7c5f 50%, #6a9c7f 100%)'
                            : style.id === 'terrain'
                            ? 'linear-gradient(135deg, #8b7355 0%, #a0937a 50%, #b5b3a0 100%)'
                            : '#d4d4d4',
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-accent/30">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Style preference saved locally
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
