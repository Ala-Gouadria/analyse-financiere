import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Chart = ({
  data = [],
  type = 'line',
  width = '100%',
  height = 300,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'],
  xAxisKey = 'name',
  yAxisKeys = ['value'],
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  stacked = false,
  className = '',
  ...props
}) => {
  // Déterminer le composant de graphique
  const ChartComponent = useMemo(() => {
    switch (type) {
      case 'line': return LineChart;
      case 'bar': return BarChart;
      case 'area': return AreaChart;
      case 'pie': return PieChart;
      default: return LineChart;
    }
  }, [type]);

  // Configurer les séries de données
  const renderSeries = () => {
    if (type === 'pie') {
      return (
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={yAxisKeys[0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      );
    }

    const SeriesComponent = type === 'line' ? Line : 
                           type === 'bar' ? Bar : Area;

    return yAxisKeys.map((key, index) => (
      <SeriesComponent
        key={key}
        type={type === 'line' ? 'monotone' : undefined}
        dataKey={key}
        stroke={colors[index % colors.length]}
        fill={colors[index % colors.length]}
        fillOpacity={type === 'area' ? 0.6 : 1}
        stackId={stacked ? 'stack' : undefined}
        name={key}
      />
    ));
  };

  // Personnaliser le tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div 
        className={`chart-container chart-empty ${className}`}
        style={{ width, height }}
      >
        <div className="empty-chart-message">
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-container ${className}`} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} {...props}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          
          {type !== 'pie' && (
            <XAxis 
              dataKey={xAxisKey}
              angle={-45}
              textAnchor="end"
              height={60}
            />
          )}
          
          {type !== 'pie' && <YAxis />}
          
          {showTooltip && (
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value) => [value, '']}
            />
          )}
          
          {showLegend && type !== 'pie' && <Legend />}
          
          {renderSeries()}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

// Composants de graphique prédéfinis
export const LineChartComponent = (props) => <Chart type="line" {...props} />;
export const BarChartComponent = (props) => <Chart type="bar" {...props} />;
export const AreaChartComponent = (props) => <Chart type="area" {...props} />;
export const PieChartComponent = (props) => <Chart type="pie" {...props} />;

// Composant de graphique avec configuration avancée
export const FinancialChart = ({ data, metrics = ['revenue', 'expenses'], ...props }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      period: item.period,
      ...metrics.reduce((acc, metric) => {
        acc[metric] = parseFloat(item[metric]) || 0;
        return acc;
      }, {})
    }));
  }, [data, metrics]);

  return (
    <Chart
      data={chartData}
      type="line"
      yAxisKeys={metrics}
      colors={['#10b981', '#ef4444', '#3b82f6']}
      showGrid
      showTooltip
      showLegend
      {...props}
    />
  );
};

export const ProfitChart = ({ data, ...props }) => (
  <FinancialChart
    data={data}
    metrics={['revenue', 'expenses', 'profit']}
    colors={['#10b981', '#ef4444', '#f59e0b']}
    {...props}
  />
);

export const CashFlowChart = ({ data, ...props }) => (
  <Chart
    data={data}
    type="area"
    yAxisKeys={['cash_balance']}
    colors={['#3b82f6']}
    showGrid
    showTooltip
    {...props}
  />
);

export default Chart;