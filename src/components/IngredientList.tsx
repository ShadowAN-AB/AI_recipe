'use client';

import { Ingredient } from '@/types';
import { formatAmount } from '@/lib/servingCalculator';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface IngredientListProps {
  ingredients: Ingredient[];
  checkable?: boolean;
}

export default function IngredientList({ ingredients, checkable = false }: IngredientListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    if (!checkable) return;
    const next = new Set(checked);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setChecked(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {ingredients.map((ing, i) => (
        <div
          key={i}
          onClick={() => toggleCheck(i)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            background: checked.has(i) ? 'rgba(74, 222, 128, 0.06)' : 'var(--bg-secondary)',
            border: `1px solid ${checked.has(i) ? 'rgba(74, 222, 128, 0.2)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-sm)',
            cursor: checkable ? 'pointer' : 'default',
            transition: 'all 150ms ease',
            opacity: checked.has(i) ? 0.6 : 1,
            textDecoration: checked.has(i) ? 'line-through' : 'none',
          }}
        >
          {checkable && (
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: `2px solid ${checked.has(i) ? 'var(--color-accent-green)' : 'var(--border-default)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: checked.has(i) ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                transition: 'all 150ms ease',
              }}
            >
              {checked.has(i) && <Check size={14} color="var(--color-accent-green)" />}
            </div>
          )}
          <span
            style={{
              fontWeight: 600,
              color: 'var(--color-primary)',
              minWidth: '70px',
              fontSize: '0.875rem',
            }}
          >
            {formatAmount(ing.amount)} {ing.unit}
          </span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
            {ing.name}
          </span>
          {ing.category && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                padding: '2px 8px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {ing.category}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
