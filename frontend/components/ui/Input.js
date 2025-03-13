import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`input ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 