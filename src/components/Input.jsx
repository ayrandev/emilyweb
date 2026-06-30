import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = '',
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full text-left ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#6b5880] ml-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xs border border-lilas-medium focus:border-[#c084fc] focus:ring-2 focus:ring-lilas-soft outline-none transition-all duration-300 text-sm text-[#4a3e56] placeholder:text-[#b0a7b8] shadow-inner ${
          error ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
}
