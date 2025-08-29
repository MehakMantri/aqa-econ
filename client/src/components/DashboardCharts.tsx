import React from "react";
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export function TrendLine({
  data,
}: {
  data: Array<{ date: string; score: number }>;
}) {
  const labels = data.map((d) => new Date(d.date).toLocaleDateString());
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Score Trend</h3>
      <div className="w-full h-64">
        {" "}
        {/* fixed height container */}
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Session score (%)",
                data: data.map((d) => d.score),
                borderColor: "#4F46E5", // Indigo-600
                backgroundColor: "rgba(79, 70, 229, 0.2)",
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { mode: "index", intersect: false },
            },
            scales: {
              y: { min: 0, max: 100, ticks: { stepSize: 20 } },
            },
          }}
        />
      </div>
    </div>
  );
}

export function WeakAreas({
  topics,
}: {
  topics: Array<{ topic: string; accuracy: number; total: number }>;
}) {
  const labels = topics.map((t) => t.topic);
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Weak Areas</h3>
      <div className="w-full h-64">
        {" "}
        {/* fixed height container */}
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Accuracy (%)",
                data: topics.map((t) => t.accuracy),
                backgroundColor: topics.map(
                  (t) =>
                    t.accuracy >= 70
                      ? "rgba(34,197,94,0.7)" // green
                      : t.accuracy >= 40
                      ? "rgba(234,179,8,0.7)" // yellow
                      : "rgba(239,68,68,0.7)" // red
                ),
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.raw}% accuracy`,
                },
              },
            },
            scales: {
              y: { min: 0, max: 100, ticks: { stepSize: 20 } },
            },
          }}
        />
        {topics.length === 0 ||
          (topics.every((t) => t.total === 0) && (
            <div className="text-center text-gray-400 italic mt-4">
              No topic data yet — practice more to unlock insights 📊
            </div>
          ))}
      </div>
      <div className="text-sm text-gray-500 mt-2">
        Lower bars indicate weaker topics to revisit.
      </div>
    </div>
  );
}
