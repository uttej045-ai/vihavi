import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, isCurrency, suffix = '' }) => {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div className="org-stat-card luxury-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="org-stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="org-stat-title" style={{ fontSize: '13px', color: 'var(--org-text-muted)', fontWeight: '500' }}>{title}</div>
        <div className="org-stat-icon" style={{
          background: 'rgba(212, 175, 55, 0.1)',
          color: 'var(--org-gold)',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          {Icon && <Icon size={16} />}
        </div>
      </div>
      <div className="org-stat-body" style={{ marginTop: '4px' }}>
        <div className="org-stat-value" style={{ fontSize: '24px', fontWeight: '800', color: '#fff', lineHeight: 1.2 }}>
          {isCurrency ? '₹' : ''}{Number(value ?? 0).toLocaleString()}{suffix}
        </div>
        {trend !== undefined && trend !== null && (
          <div className="org-stat-trend" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', marginTop: '8px' }}>
            {isPositive ? <ArrowUpRight size={14} color="#52c41a" /> : <ArrowDownRight size={14} color="#ff4d4f" />}
            <span style={{ color: isPositive ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>{Math.abs(Number(trend ?? 0))}%</span>
            <span style={{ color: 'var(--org-text-muted)' }}>from last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
