import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  ...props
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

export default Card; 