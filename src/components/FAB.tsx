import React from 'react';

interface FABProps {
  onClick?: () => void;
  tooltip?: string;
  href?: string;
}

const FAB: React.FC<FABProps> = ({ onClick, tooltip = "Nova Receção", href }) => {
  const buttonContent = (
    <div className="absolute bottom-8 right-8 group">
      <button
        onClick={onClick}
        aria-label={tooltip}
        className="flex items-center justify-center w-16 h-16 bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 rounded-none shadow-lg transition-all duration-200"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>
      <div className="absolute right-0 bottom-full mb-2 w-40 text-center py-2 px-3 bg-gray-700 text-white text-sm rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ transform: 'translateX(-35%)' }}>
        {tooltip}
        <div className="absolute left-1/2 -bottom-2 w-4 h-4 bg-gray-700" style={{ transform: 'translateX(-50%) rotate(45deg)' }}></div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href}>
        {buttonContent}
      </a>
    );
  }

  return buttonContent;
};

export default FAB;
