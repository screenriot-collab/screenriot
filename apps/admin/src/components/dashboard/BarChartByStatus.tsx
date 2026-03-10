import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/** Format status key for display (e.g. pending_approval -> Pending approval). */
function formatStatusKey(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

interface BarChartByStatusProps {
  data: Record<string, number>;
  barColor?: string;
}

export function BarChartByStatus({ data, barColor = '#8b5cf6' }: BarChartByStatusProps) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const chartData = entries.length
    ? entries.map(([name, count]) => ({ name: formatStatusKey(name), count }))
    : [{ name: '—', count: 0 }];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            labelStyle={{ color: '#e5e7eb' }}
            formatter={(value: number | undefined) => [value ?? 0, 'Count']}
          />
          <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
