import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Filter, Search } from 'lucide-react';
import Input from './Input';
import Button from './Button';

const Table = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  sortable = false,
  pagination = false,
  pageSize = 10,
  striped = false,
  hover = true,
  compact = false,
  className = '',
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer les données
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item =>
      columns.some(column => {
        const value = item[column.key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Trier les données
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Gestion des types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, sortable]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Gestion du tri
  const handleSort = (columnKey) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Rendu des en-têtes
  const renderHeader = () => (
    <thead>
      <tr>
        {columns.map(column => (
          <th
            key={column.key}
            className={`
              ${sortable ? 'sortable' : ''}
              ${sortColumn === column.key ? 'sorted' : ''}
              ${column.align ? `text-${column.align}` : ''}
            `}
            onClick={() => handleSort(column.key)}
            style={{ width: column.width }}
          >
            <div className="th-content">
              <span>{column.title}</span>
              {sortable && sortColumn === column.key && (
                <span className="sort-icon">
                  {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  // Rendu du corps
  const renderBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className="table-loading">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <span>Chargement des données...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className="table-empty">
              <div className="empty-content">
                <span>{emptyMessage}</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {paginatedData.map((row, index) => (
          <tr
            key={row.id || index}
            className={`
              ${striped && index % 2 === 0 ? 'striped' : ''}
              ${hover ? 'hoverable' : ''}
            `}
          >
            {columns.map(column => (
              <td
                key={column.key}
                className={column.align ? `text-${column.align}` : ''}
              >
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // Rendu de la pagination
  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    return (
      <div className="table-pagination">
        <div className="pagination-info">
          Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, sortedData.length)} sur {sortedData.length} entrées
        </div>
        
        <div className="pagination-controls">
          <Button
            variant="outline"
            size="small"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            Première
          </Button>
          
          <Button
            variant="outline"
            size="small"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Précédent
          </Button>
          
          <span className="pagination-current">
            Page {currentPage} sur {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="small"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Suivant
          </Button>
          
          <Button
            variant="outline"
            size="small"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Dernière
          </Button>
        </div>
      </div>
    );
  };

  const tableClasses = [
    'table',
    compact ? 'table-compact' : '',
    striped ? 'table-striped' : '',
    hover ? 'table-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="table-container">
      {/* Barre de recherche */}
      {searchable && (
        <div className="table-search">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="search"
            fullWidth
          />
        </div>
      )}

      {/* Tableau */}
      <div className="table-wrapper">
        <table className={tableClasses} {...props}>
          {renderHeader()}
          {renderBody()}
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

// Composant de tableau spécialisé pour les données financières
export const FinancialTable = ({ data, ...props }) => {
  const columns = [
    {
      key: 'period',
      title: 'Période',
      width: '120px'
    },
    {
      key: 'revenue',
      title: 'Revenus',
      align: 'right',
      render: (value) => new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value)
    },
    {
      key: 'expenses',
      title: 'Dépenses',
      align: 'right',
      render: (value) => new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value)
    },
    {
      key: 'profit',
      title: 'Bénéfice',
      align: 'right',
      render: (value, row) => {
        const profit = parseFloat(row.revenue) - parseFloat(row.expenses);
        const className = profit >= 0 ? 'positive' : 'negative';
        return (
          <span className={className}>
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            }).format(profit)}
          </span>
        );
      }
    },
    {
      key: 'profit_margin',
      title: 'Marge',
      align: 'right',
      render: (value) => `${value}%`
    }
  ];

  return (
    <Table
      columns={columns}
      data={data}
      sortable
      searchable
      pagination
      striped
      hover
      {...props}
    />
  );
};

export default Table;