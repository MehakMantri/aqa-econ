import React from 'react';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export function TrendLine({ data }: { data: Array<{date: string, score: number}> }) {
  const labels = data.map(d => new Date(d.date).toLocaleDateString());
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Score Trend</h3>
      <Line data={{
        labels,
        datasets: [{ label: 'Session score (%)', data: data.map(d => d.score) }]
      }} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
    </div>
  );
}

export function WeakAreas({ topics }: { topics: Array<{topic: string, accuracy: number, total: number}> }) {
  const labels = topics.map(t => t.topic);
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Weak Areas</h3>
      <Bar data={{
        labels,
        datasets: [{ label: 'Accuracy (%)', data: topics.map(t => t.accuracy) }]
      }} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
      <div className="text-sm text-gray-500 mt-2">Lower bars indicate weaker topics to revisit.</div>
    </div>
  );
}
