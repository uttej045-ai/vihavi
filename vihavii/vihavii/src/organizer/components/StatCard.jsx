import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import '../styles/StatCard.css';

const StatCard = ({ title, value, icon: Icon, trend, isCurrency }) => {
  const isPositive = trend >= 0;

  return (
    <div className="org-stat-card glass-card">
      <div className="org-stat-header">
        <div className="org-stat-title">{title}</div>
        <div className="org-stat-icon">
          <Icon size={16} />
        </div>
      </div>
      <div className="org-stat-body">
        <div className="org-stat-value">
          {isCurrency ? '$' : ''}{value.toLocaleString()}
        </div>
        <div className={`org-stat-trend ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{Math.abs(trend)}% from last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
