import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-brand-light rounded-xl shadow-card p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;