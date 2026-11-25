import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  link?: string;
  accent?: 'navy' | 'orange' | 'success' | 'danger' | 'warning' | 'neutral';
  trend?: {
    text: string;
    direction: 'up' | 'down' | 'neutral' | 'warning';
  };
  progressBar?: {
    value: number;
    max?: number;
    color?: string;
    label?: string;
  };
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'orange' | 'navy';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  iconBg = 'var(--primary-subtle)',
  iconColor = 'var(--primary)',
  link,
  accent = 'navy',
  trend,
  progressBar,
  badge,
}) => {
  const navigate = useNavigate();

  const renderTrendIcon = (direction: 'up' | 'down' | 'neutral' | 'warning') => {
    switch (direction) {
      case 'up':
        return <ArrowUpRight size={13} />;
      case 'down':
        return <ArrowDownRight size={13} />;
      case 'warning':
        return <AlertTriangle size={13} />;
      default:
        return <Minus size={13} />;
    }
  };

  return (
    <div
      className={`kmtms-stat-card ${accent ? `accent-${accent}` : ''}`}
      onClick={() => link && navigate(link)}
      style={{
        cursor: link ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ flex: 1, paddingRight: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </span>
            {badge && (
              <span className={`badge-kmtms-${badge.variant}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                {badge.text}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '4px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {value}
          </div>
        </div>

        <div
          className="stat-icon-wrapper"
          style={{
            backgroundColor: iconBg,
            color: iconColor,
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          {icon}
        </div>
      </div>

      {progressBar && (
        <div style={{ margin: '0.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
            <span>{progressBar.label || 'Progress'}</span>
            <span style={{ fontWeight: 600 }}>{Math.round((progressBar.value / (progressBar.max || 100)) * 100)}%</span>
          </div>
          <div style={{ height: '5px', backgroundColor: 'var(--surface-alt)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, (progressBar.value / (progressBar.max || 100)) * 100)}%`,
                height: '100%',
                backgroundColor: progressBar.color || 'var(--brand-orange)',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', marginTop: '4px', gap: '6px' }}>
        {subtext && <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtext}</span>}
        {trend && (
          <span className={`stat-trend-chip ${trend.direction}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>
            {renderTrendIcon(trend.direction)}
            <span>{trend.text}</span>
          </span>
        )}
      </div>
    </div>
  );
};
