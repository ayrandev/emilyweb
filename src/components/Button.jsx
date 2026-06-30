import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false 
}) {
  const baseStyles = 'px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 transform active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variants = {
    primary: 'bg-rosa-baby hover:bg-[#ffb3c6] text-[#6b3040] focus:ring-rosa-baby',
    secondary: 'bg-azul-baby hover:bg-[#bce6fa] text-[#2c5364] focus:ring-azul-baby',
    success: 'bg-verde-baby hover:bg-[#b8f5b8] text-[#2d5a2d] focus:ring-verde-baby',
    outline: 'border-2 border-lilas-medium hover:bg-lilas-soft text-[#6b5880] focus:ring-lilas-medium',
    accent: 'bg-[#b39ddb] hover:bg-[#9575cd] text-white focus:ring-[#9575cd]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
