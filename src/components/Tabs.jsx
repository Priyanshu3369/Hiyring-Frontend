import { useState } from 'react';

export default function Tabs({
  tabs = [],
  defaultTab = 0,
  onChange,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="flex border-b border-[var(--border-light)]">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`
              font-heading font-semibold px-4 py-3 text-[0.95rem] 
              border-b-2 transition-all duration-200 bg-transparent border-0 cursor-pointer
              ${
                activeTab === index
                  ? 'text-[var(--text-primary)] border-b-[var(--accent)]'
                  : 'text-[var(--text-muted)] border-b-transparent hover:text-[var(--text-primary)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
