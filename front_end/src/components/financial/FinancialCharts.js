import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Download } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const FinancialCharts = ({ financialData, period = '12m' }) => {
  const [activeChart, setActiveChart] = useState('revenue');
  const [chartType, setChartType] = useState('line');

  // Préparer les données pour les graphiques
  const chartData = useMemo(() => {
    if (!financialData || financialData.length === 0) return [];

    return financialData
      .slice()
      .sort((a, b) => new Date(a.period) - new Date(b.period))
      .map(item => ({
        period: new Date(item.period).toLocaleDateString('fr-FR', { 
          month: 'short', 
          year: 'numeric' 
        }),
        fullDate: new Date(item.period),
        revenue: parseFloat(item.revenue),
        expenses: parseFloat(item.expenses),
        profit: parseFloat(item.revenue) - parseFloat(item.expenses),
        profitMargin: item.profit_margin,
        cash_balance: parseFloat(item.cash_balance),
        employees: parseInt(item.employees)
      }));
  }, [financialData]);

  // Données pour le graphique en camembert (répartition des dépenses)
  const expenseData = useMemo(() => {
    if (!financialData || financialData.length === 0) return [];

    const latestData = financialData
      .slice()
      .sort((a, b) => new Date(b.period) - new Date(a.period))[0];

    if (!latestData) return [];

    const revenue = parseFloat(latestData.revenue);
    const expenses = parseFloat(latestData.expenses);
    const salaries = (parseInt(latestData.employees) || 0) * (parseFloat(latestData.average_salary) || 0);
    const otherExpenses = expenses - salaries;

    return [
      { name: 'Salaires', value: salaries, color: '#8884d8' },
      { name: 'Autres dépenses', value: otherExpenses, color: '#82ca9d' },
      { name: 'Bénéfice', value: revenue - expenses, color: '#ffc658' }
    ].filter(item => item.value > 0);
  }, [financialData]);

  const chartConfigs = {
    revenue: {
      title: 'Revenus et Dépenses',
      dataKey: ['revenue', 'expenses'],
      colors: ['#8884d8', '#82ca9d'],
      labels: ['Revenus', 'Dépenses']
    },
    profit: {
      title: 'Bénéfice',
      dataKey: ['profit'],
      colors: ['#ffc658'],
      labels: ['Bénéfice']
    },
    cash: {
      title: 'Trésorerie',
      dataKey: ['cash_balance'],
      colors: ['#0088FE'],
      labels: ['Trésorerie']
    },
    margin: {
      title: 'Marge Bénéficiaire',
      dataKey: ['profitMargin'],
      colors: ['#00C49F'],
      labels: ['Marge %']
    },
    expenses: {
      title: 'Répartition des Dépenses',
      dataKey: ['value'],
      colors: expenseData.map(item => item.color),
      labels: expenseData.map(item => item.name)
    }
  };

  const renderChart = () => {
    const config = chartConfigs[activeChart];

    if (activeChart === 'expenses') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${parseFloat(value).toFixed(2)} €`, 'Montant']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const ChartComponent = chartType === 'line' ? LineChart : 
                          chartType === 'bar' ? BarChart : AreaChart;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="period" 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${parseFloat(value).toFixed(2)} €`, '']}
            labelFormatter={(label) => `Période: ${label}`}
          />
          <Legend />
          {config.dataKey.map((key, index) => {
            const ChartElement = chartType === 'line' ? Line : 
                               chartType === 'bar' ? Bar : Area;
            
            return (
              <ChartElement
                key={key}
                type={chartType === 'line' ? 'monotone' : undefined}
                dataKey={key}
                stroke={config.colors[index]}
                fill={config.colors[index]}
                name={config.labels[index]}
                fillOpacity={chartType === 'area' ? 0.6 : 1}
              />
            );
          })}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const exportChart = () => {
    // Simuler l'export (dans une vraie app, on générerait un PDF/Excel)
    const chartDataStr = JSON.stringify(chartData, null, 2);
    const blob = new Blob([chartDataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donnees-financieres-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!financialData || financialData.length === 0) {
    return (
      <Card className="financial-charts">
        <div className="charts-empty">
          <BarChart3 size={48} className="empty-icon" />
          <h3>Aucune donnée financière</h3>
          <p>Ajoutez des données financières pour voir les graphiques</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="financial-charts">
      <div className="charts-header">
        <div className="charts-title">
          <TrendingUp size={24} />
          <h2>Analyses Graphiques</h2>
        </div>
        
        <div className="charts-controls">
          <div className="chart-type-selector">
            <Button
              variant={chartType === 'line' ? 'primary' : 'outline'}
              size="small"
              onClick={() => setChartType('line')}
              icon={<TrendingUp size={14} />}
            >
              Ligne
            </Button>
            <Button
              variant={chartType === 'bar' ? 'primary' : 'outline'}
              size="small"
              onClick={() => setChartType('bar')}
              icon={<BarChart3 size={14} />}
            >
              Barres
            </Button>
            <Button
              variant={chartType === 'area' ? 'primary' : 'outline'}
              size="small"
              onClick={() => setChartType('area')}
            >
              Surface
            </Button>
          </div>

          <Button
            variant="outline"
            size="small"
            onClick={exportChart}
            icon={<Download size={14} />}
          >
            Exporter
          </Button>
        </div>
      </div>

      <div className="charts-navigation">
        {Object.entries(chartConfigs).map(([key, config]) => (
          <button
            key={key}
            className={`chart-nav-button ${activeChart === key ? 'active' : ''}`}
            onClick={() => setActiveChart(key)}
          >
            {config.title}
          </button>
        ))}
      </div>

      <div className="chart-container">
        {renderChart()}
      </div>

      {/* Statistiques rapides */}
      <div className="quick-stats">
        <div className="stat">
          <span className="stat-label">Dernier revenu</span>
          <span className="stat-value">
            {chartData[chartData.length - 1]?.revenue.toFixed(2)} €
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Dernier bénéfice</span>
          <span className={`stat-value ${chartData[chartData.length - 1]?.profit >= 0 ? 'positive' : 'negative'}`}>
            {chartData[chartData.length - 1]?.profit.toFixed(2)} €
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Trésorerie actuelle</span>
          <span className="stat-value">
            {chartData[chartData.length - 1]?.cash_balance.toFixed(2)} €
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Moyenne mensuelle</span>
          <span className="stat-value">
            {(chartData.reduce((sum, item) => sum + item.revenue, 0) / chartData.length).toFixed(2)} €
          </span>
        </div>
      </div>
    </Card>
  );
};

export default FinancialCharts;