'use client';

import { Minus, Plus, Users } from 'lucide-react';

interface ServingSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function ServingSlider({
  value,
  onChange,
  min = 1,
  max = 20,
}: ServingSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Users size={18} color="var(--color-primary)" />
      <button
        className="btn btn-icon btn-secondary"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{ width: 32, height: 32, padding: 0 }}
      >
        <Minus size={14} />
      </button>

      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{
            width: '100%',
            appearance: 'none',
            height: '6px',
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--bg-tertiary) ${percentage}%, var(--bg-tertiary) 100%)`,
            borderRadius: '3px',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--color-primary);
            border: 3px solid var(--bg-primary);
            box-shadow: 0 2px 8px var(--color-primary-glow);
            cursor: pointer;
            transition: transform 150ms ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
        `}</style>
      </div>

      <button
        className="btn btn-icon btn-secondary"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{ width: 32, height: 32, padding: 0 }}
      >
        <Plus size={14} />
      </button>

      <div
        style={{
          minWidth: '80px',
          textAlign: 'center',
          fontSize: '0.875rem',
        }}
      >
        <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{value}</strong>
        <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>
          {value === 1 ? 'serving' : 'servings'}
        </span>
      </div>
    </div>
  );
}
