import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--tertiary)] text-[var(--on-tertiary)] hover:brightness-105',
    secondary: 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)] hover:brightness-110',
    ghost: 'hover:bg-[var(--surface-highest)] text-[var(--on-surface)]',
    glass: 'glass text-[var(--on-surface)] hover:bg-[var(--surface-bright)]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)]',
    md: 'px-4 py-2 text-base rounded-[var(--radius-md)]',
    lg: 'px-6 py-3 text-lg rounded-[var(--radius-lg)]',
    xl: 'px-8 py-4 text-xl rounded-[var(--radius-xl)]'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}> = ({ children, className = '', elevated = false }) => {
  return (
    <div className={`
      monolith-card 
      ${elevated ? 'shadow-ambient' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`
        w-full bg-[var(--surface-highest)] 
        text-[var(--on-surface)] 
        px-4 py-2 
        rounded-[var(--radius-md)] 
        border-none 
        focus:outline-none 
        focus:ring-2 
        focus:ring-[var(--primary)]/40 
        transition-all 
        ${className}
      `}
      {...props}
    />
  );
};
