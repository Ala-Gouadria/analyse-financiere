import React, { useState, useMemo } from 'react';
import { 
  Edit3, 
  Trash2, 
  Plus, 
  Download, 
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { financialDataService } from '../../services/financialData';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const DataTable = ({ 
  financialData, 
  projectId, 
  onEdit, 
  onRefresh,
  loading = false 
}) => {
  const [sortField, setSortField] = useState('period');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  // Fonction de tri
  const sortedData = useMemo(() => {
    if (!financialData) return [];

    return [...financialData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Gestion des dates
      if (sortField === 'period') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Gestion des nombres
      if (typeof aValue === 'string' && !isNaN(aValue)) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [financialData, sortField, sortDirection]);

  // Fonction de recherche
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;

    return sortedData.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, searchTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ces données ?')) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      
      await financialDataService.deleteFinancialData(id);
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Période', 'Revenus', 'Dépenses', 'Bénéfice', 'Marge %', 'Employés', 'Salaire Moyen', 'Trésorerie'];
    const csvData = filteredData.map(item => [
      new Date(item.period).toLocaleDateString('fr-FR'),
      item.revenue,
      item.expenses,
      (parseFloat(item.revenue) - parseFloat(item.expenses)).toFixed(2),
      item.profit_margin,
      item.employees,
      item.average_salary,
      item.cash_balance
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donnees-financieres-${projectId}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  if (loading) {
    return (
      <Card className="data-table">
        <div className="table-loading">
          <LoadingSpinner text="Chargement des données..." />
        </div>
      </Card>
    );
  }

  return (
    <Card className="data-table">
      <div className="table-header">
        <div className="table-title">
          <h3>Données Financières</h3>
          <span className="table-count">
            {filteredData.length} entrée{filteredData.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="table-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <Button
            variant="outline"
            onClick={exportToCSV}
            icon={<Download size={16} />}
          >
            CSV
          </Button>

          <Button
            onClick={() => onEdit?.(null)}
            icon={<Plus size={16} />}
          >
            Ajouter
          </Button>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {filteredData.length === 0 ? (
        <div className="table-empty">
          <p>Aucune donnée financière trouvée</p>
          <Button
            onClick={() => onEdit?.(null)}
            icon={<Plus size={16} />}
          >
            Ajouter la première entrée
          </Button>
        </div>
      ) : (
        <div className="table-container">
          <table className="financial-table">
            <thead>
              <tr>
                <th 
                  className="sortable"
                  onClick={() => handleSort('period')}
                >
                  Période {getSortIcon('period')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('revenue')}
                >
                  Revenus {getSortIcon('revenue')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('expenses')}
                >
                  Dépenses {getSortIcon('expenses')}
                </th>
                <th>Bénéfice</th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('profit_margin')}
                >
                  Marge {getSortIcon('profit_margin')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('employees')}
                >
                  Employés {getSortIcon('employees')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('cash_balance')}
                >
                  Trésorerie {getSortIcon('cash_balance')}
                </th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => {
                const profit = parseFloat(item.revenue) - parseFloat(item.expenses);
                const profitMargin = item.profit_margin;

                return (
                  <tr key={item.id}>
                    <td className="period-cell">
                      {formatDate(item.period)}
                    </td>
                    <td className="revenue-cell">
                      {formatCurrency(parseFloat(item.revenue))}
                    </td>
                    <td className="expenses-cell">
                      {formatCurrency(parseFloat(item.expenses))}
                    </td>
                    <td className={`profit-cell ${profit >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(profit)}
                    </td>
                    <td className={`margin-cell ${profitMargin >= 0 ? 'positive' : 'negative'}`}>
                      {profitMargin}%
                    </td>
                    <td className="employees-cell">
                      {item.employees || '-'}
                    </td>
                    <td className="cash-cell">
                      {formatCurrency(parseFloat(item.cash_balance))}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => onEdit?.(item)}
                          icon={<Edit3 size={14} />}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          icon={deletingId === item.id ? <LoadingSpinner size="small" /> : <Trash2 size={14} />}
                        >
                          {deletingId === item.id ? '' : 'Supprimer'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Résumé */}
      {filteredData.length > 0 && (
        <div className="table-summary">
          <div className="summary-item">
            <span className="summary-label">Total Revenus:</span>
            <span className="summary-value">
              {formatCurrency(filteredData.reduce((sum, item) => sum + parseFloat(item.revenue), 0))}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Dépenses:</span>
            <span className="summary-value">
              {formatCurrency(filteredData.reduce((sum, item) => sum + parseFloat(item.expenses), 0))}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Bénéfice Total:</span>
            <span className={`summary-value ${
              filteredData.reduce((sum, item) => sum + (parseFloat(item.revenue) - parseFloat(item.expenses)), 0) >= 0 
                ? 'positive' 
                : 'negative'
            }`}>
              {formatCurrency(filteredData.reduce((sum, item) => sum + (parseFloat(item.revenue) - parseFloat(item.expenses)), 0))}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Moyenne Marge:</span>
            <span className="summary-value">
              {(filteredData.reduce((sum, item) => sum + parseFloat(item.profit_margin), 0) / filteredData.length).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DataTable;