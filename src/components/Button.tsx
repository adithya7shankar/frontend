import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline'; // For future variations
  size?: 'sm' | 'md' | 'lg';
  href?: string; // If the button acts as a link
  className?: string; // Allow additional classes
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] active:brightness-95'; // Added transform, hover/active scale, active brightness

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base', // Default size
    lg: 'px-8 py-3 text-lg',
  };

  const variantStyles = {
    primary: 'bg-calm-blue-accent hover:bg-calm-blue-accent-hover text-green-700 focus:ring-calm-blue-accent-hover disabled:opacity-60', // Changed text-white to text-green-700
    secondary: 'bg-warm-surface hover:bg-warm-border-soft text-warm-text-primary border border-warm-border-medium focus:ring-calm-blue-accent disabled:opacity-60', // Example secondary
    outline: 'border border-calm-blue-accent text-calm-blue-accent hover:bg-calm-blue-accent/10 focus:ring-calm-blue-accent disabled:opacity-60', // Example outline
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClassName} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;
