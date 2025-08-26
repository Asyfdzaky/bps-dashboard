import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
    [key: string]: number;
}

interface StatusBukuChartProps {
    data: ChartData;
    title?: string;
}

const COLORS = ['#f87171', '#60a5fa', '#34d399'];

export default function StatusBukuChart({ data, title = 'Status Buku' }: StatusBukuChartProps) {
    // Convert the data object to array format for Recharts
    const chartData = Object.entries(data).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <div className="w-full">
            {title && <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>}
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="value">
                        {chartData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} buku`, 'Jumlah']} labelFormatter={(label: string) => `Status: ${label}`} />
                    <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span className="text-sm">{value}</span>} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
