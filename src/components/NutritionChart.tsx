'use client';

import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { NutritionInfo } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface NutritionChartProps {
  nutrition: NutritionInfo;
  size?: number;
}

export default function NutritionChart({ nutrition, size = 220 }: NutritionChartProps) {
  const chartRef = useRef(null);

  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [nutrition.protein, nutrition.carbs, nutrition.fat],
        backgroundColor: [
          'rgba(96, 165, 250, 0.8)',    // blue
          'rgba(255, 107, 53, 0.8)',     // orange
          'rgba(167, 139, 250, 0.8)',    // purple
        ],
        borderColor: [
          'rgba(96, 165, 250, 1)',
          'rgba(255, 107, 53, 1)',
          'rgba(167, 139, 250, 1)',
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
        cutout: '65%',
        borderRadius: 4,
        spacing: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F1F5F9',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context: { label: string; raw: unknown }) {
            return `${context.label}: ${context.raw}g`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      duration: 800,
    },
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        const chart = chartRef.current as ChartJS;
        chart.destroy();
      }
    };
  }, []);

  return (
    <div style={{ width: size, margin: '0 auto' }}>
      <div style={{ position: 'relative' }}>
        <Doughnut ref={chartRef} data={data} options={options} />
        {/* Center text */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9' }}>
            {nutrition.calories}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>calories</div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Protein', value: nutrition.protein, color: 'rgba(96, 165, 250, 0.8)' },
          { label: 'Carbs', value: nutrition.carbs, color: 'rgba(255, 107, 53, 0.8)' },
          { label: 'Fat', value: nutrition.fat, color: 'rgba(167, 139, 250, 0.8)' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: item.color,
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              {item.label}: <strong style={{ color: '#F1F5F9' }}>{item.value}g</strong>
            </span>
          </div>
        ))}
      </div>

      {/* Additional nutrients */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '12px',
          fontSize: '0.75rem',
          color: '#64748B',
        }}
      >
        <span>Fiber: {nutrition.fiber}g</span>
        <span>Sugar: {nutrition.sugar}g</span>
      </div>
    </div>
  );
}
