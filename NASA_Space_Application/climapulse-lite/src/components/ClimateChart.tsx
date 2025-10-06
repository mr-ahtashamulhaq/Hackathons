'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { WeatherData } from '@/utils/openMeteo';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ClimateChartProps {
  data: WeatherData;
  type: 'temperature' | 'precipitation';
  title: string;
}

export default function ClimateChart({ data, type, title }: ClimateChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      [key: string]: unknown;
    }>;
  } | null>(null);
  const [chartOptions, setChartOptions] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!data || data.dates.length === 0) return;

    // Aggregate data by month for better visualization
    const monthlyData = aggregateByMonth(data, type);

    if (type === 'temperature') {
      setChartData({
        labels: monthlyData.labels,
        datasets: [
          {
            label: 'Average Temperature (°C)',
            data: monthlyData.values,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      });

      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            title: {
              display: true,
              text: 'Temperature (°C)',
            },
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
      });
    } else {
      setChartData({
        labels: monthlyData.labels,
        datasets: [
          {
            label: 'Monthly Precipitation (mm)',
            data: monthlyData.values,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      });

      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            title: {
              display: true,
              text: 'Precipitation (mm)',
            },
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
      });
    }
  }, [data, type, title]);

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="chart-container h-80">
        {type === 'temperature' ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

function aggregateByMonth(data: WeatherData, type: 'temperature' | 'precipitation') {
  const monthlyAgg: { [key: string]: number[] } = {};

  data.dates.forEach((date, index) => {
    const monthKey = date.substring(0, 7); // YYYY-MM
    if (!monthlyAgg[monthKey]) {
      monthlyAgg[monthKey] = [];
    }
    
    const value = type === 'temperature' 
      ? data.temperatures[index] 
      : data.precipitation[index];
    
    if (value !== undefined && !isNaN(value)) {
      monthlyAgg[monthKey].push(value);
    }
  });

  const labels: string[] = [];
  const values: number[] = [];

  Object.keys(monthlyAgg)
    .sort()
    .forEach(monthKey => {
      const monthData = monthlyAgg[monthKey];
      if (monthData.length > 0) {
        const [year, month] = monthKey.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels.push(`${monthNames[parseInt(month) - 1]} ${year}`);
        
        if (type === 'temperature') {
          // Average temperature for the month
          const avg = monthData.reduce((sum, val) => sum + val, 0) / monthData.length;
          values.push(Math.round(avg * 10) / 10);
        } else {
          // Total precipitation for the month
          const total = monthData.reduce((sum, val) => sum + val, 0);
          values.push(Math.round(total * 10) / 10);
        }
      }
    });

  return { labels, values };
}