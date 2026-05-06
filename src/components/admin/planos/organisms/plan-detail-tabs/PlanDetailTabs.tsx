'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PlanDetailTabDefinition {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
}

interface PlanDetailTabsProps {
  tabs: PlanDetailTabDefinition[];
  /** Optional controlled mode — when provided, parent owns the active tab. */
  activeTab?: string;
  onActiveTabChange?: (id: string) => void;
}

export function PlanDetailTabs({
  tabs,
  activeTab,
  onActiveTabChange,
}: PlanDetailTabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id ?? '');
  const isControlled = activeTab !== undefined;
  const current = isControlled ? activeTab : internalActive;

  function handleClick(id: string) {
    if (!isControlled) setInternalActive(id);
    onActiveTabChange?.(id);
  }

  const active = tabs.find((t) => t.id === current) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Seções do plano"
        className="flex gap-0 border-b border-gray-100 px-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === current;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleClick(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
                '-mb-px border-b-2',
                isActive
                  ? 'border-[#4E8C75] text-[#4E8C75]'
                  : 'border-transparent text-[#6B6B6E] hover:text-[#2C2C2E]',
              )}
            >
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-[#EAF4F0] text-[#4E8C75]'
                      : 'bg-gray-100 text-[#6B6B6E]',
                  )}
                  aria-label={`${tab.count} itens`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${active?.id ?? ''}`}
        aria-labelledby={`tab-${active?.id ?? ''}`}
        className="pt-4"
      >
        {active?.content}
      </div>
    </div>
  );
}
