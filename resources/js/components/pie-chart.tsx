import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
    [key: string]: number;
}

interface StatusBukuChartProps {
    data: ChartData;
    title?: string;
}

// Fungsi untuk mendapatkan warna dari CSS variables
const getCSSVariable = (variable: string) => {
    if (typeof window !== 'undefined') {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    }
    return '';
};

// Menggunakan warna yang konsisten dengan tema app.css
const getChartColors = () => {
    // Fallback colors jika CSS variables tidak tersedia
    const fallbackColors = ['#60a5fa', '#34d399', '#ef4444'];

    try {
        const chart2 = getCSSVariable('--chart-1');
        const chart3 = getCSSVariable('--chart-2');
        const destructive = getCSSVariable('--chart-3');

        return [chart2, chart3, destructive];
    } catch {
        return fallbackColors;
    }
};

export default function StatusBukuChart({ data, title = 'Status Buku' }: StatusBukuChartProps) {
    // Convert the data object to array format for Recharts
    const chartData = Object.entries(data).map(([name, value]) => ({
        name,
        value,
    }));

    // Get colors from CSS variables
    const colors = getChartColors();

    return (
        <div className="w-full">
            {title && <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>}
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="value">
                        {chartData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} buku`, 'Jumlah']} labelFormatter={(label: string) => `Status: ${label}`} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string) => <span className="text-sm text-foreground">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
