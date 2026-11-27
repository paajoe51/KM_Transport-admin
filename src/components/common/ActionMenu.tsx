import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tone?: 'default' | 'primary' | 'warning' | 'success' | 'danger';
  dividerBefore?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  ariaLabel?: string;
}

const TONE_COLORS: Record<NonNullable<ActionMenuItem['tone']>, string> = {
  default: 'var(--text-primary)',
  primary: 'var(--primary)',
  warning: '#b45309',
  success: '#15803d',
  danger: '#dc2626',
};

export const ActionMenu: React.FC<ActionMenuProps> = ({ items, ariaLabel = 'Row actions' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 180;
    const estimatedHeight = items.length * 36 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8
    );

    if (openUpward) {
      setCoords({
        bottom: window.innerHeight - rect.top + 4,
        left,
      });
    } else {
      setCoords({
        top: rect.bottom + 4,
        left,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="btn btn-sm"
        style={{
          padding: '4px 6px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          backgroundColor: isOpen ? 'var(--surface-alt)' : 'var(--surface)',
          color: 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
        title="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              minWidth: '180px',
              backgroundColor: 'var(--surface, #ffffff)',
              border: '1px solid var(--border, #e2e8f0)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.14), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
              padding: '4px',
              zIndex: 9999,
            }}
          >
            {items.map((item, idx) => {
              const color = TONE_COLORS[item.tone || 'default'];
              return (
                <React.Fragment key={idx}>
                  {item.dividerBefore && (
                    <div
                      style={{
                        height: '1px',
                        backgroundColor: 'var(--border, #e2e8f0)',
                        margin: '4px 6px',
                      }}
                    />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      item.onClick();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        item.tone === 'danger' ? 'rgba(220, 38, 38, 0.08)' : 'var(--surface-alt, #f1f5f9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};
