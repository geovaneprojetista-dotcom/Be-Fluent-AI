import React from 'react';

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const baseStyles = 'px-6 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-brand-primary text-brand-secondary shadow-sm hover:shadow-glow focus:ring-brand-primary',
    secondary: 'bg-brand-dark text-text-primary hover:bg-opacity-80 focus:ring-brand-accent',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;