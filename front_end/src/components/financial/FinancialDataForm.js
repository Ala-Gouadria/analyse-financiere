import React, { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Users, Save, X } from 'lucide-react';
import { financialDataService } from '../../services/financialData';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const FinancialDataForm = ({ projectId, existingData = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    period: '',
    revenue: '',
    expenses: '',
    employees: '',
    average_salary: '',
    cash_balance: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (existingData) {
      setIsEditing(true);
      setFormData({
        period: existingData.period.split('T')[0], // Format YYYY-MM-DD
        revenue: existingData.revenue || '',
        expenses: existingData.expenses || '',
        employees: existingData.employees || '',
        average_salary: existingData.average_salary || '',
        cash_balance: existingData.cash_balance || ''
      });
    }
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.period) {
      setError('La période est requise');
      return false;
    }

    if (!formData.revenue || !formData.expenses || !formData.cash_balance) {
      setError('Les champs Revenus, Dépenses et Trésorerie sont obligatoires');
      return false;
    }

    if (parseFloat(formData.revenue) < 0 || parseFloat(formData.expenses) < 0) {
      setError('Les revenus et dépenses doivent être positifs');
      return false;
    }

    return true;
  };

  const calculateMetrics = () => {
    const revenue = parseFloat(formData.revenue) || 0;
    const expenses = parseFloat(formData.expenses) || 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const monthlyBurnRate = expenses;
    const runway = (parseFloat(formData.cash_balance) || 0) / (monthlyBurnRate || 1);

    return {
      profit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      monthlyBurnRate: Math.round(monthlyBurnRate * 100) / 100,
      runway: Math.round(runway * 10) / 10
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const submitData = {
        projectId: parseInt(projectId),
        period: formData.period,
        revenue: parseFloat(formData.revenue),
        expenses: parseFloat(formData.expenses),
        employees: parseInt(formData.employees) || 0,
        average_salary: parseFloat(formData.average_salary) || 0,
        cash_balance: parseFloat(formData.cash_balance)
      };

      let result;
      if (isEditing) {
        result = await financialDataService.updateFinancialData(existingData.id, submitData);
      } else {
        result = await financialDataService.addFinancialData(submitData);
      }

      if (result.success) {
        onSave?.(result.data.financial_data);
        // Reset form if not editing
        if (!isEditing) {
          setFormData({
            period: '',
            revenue: '',
            expenses: '',
            employees: '',
            average_salary: '',
            cash_balance: ''
          });
        }
      }
    } catch (error) {
      console.error('Financial data save error:', error);
      setError(error.response?.data?.error || `Erreur lors de la ${isEditing ? 'modification' : 'sauvegarde'}`);
    } finally {
      setLoading(false);
    }
  };

  const metrics = calculateMetrics();

  return (
    <Card className="financial-data-form">
      <div className="form-header">
        <h2>
          {isEditing ? 'Modifier les données financières' : 'Nouvelles données financières'}
        </h2>
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            icon={<X size={16} />}
          >
            Annuler
          </Button>
        )}
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError('')}
        />
      )}

      <form onSubmit={handleSubmit} className="financial-form">
        <div className="form-grid">
          {/* Période */}
          <div className="form-group">
            <label htmlFor="period" className="form-label">
              <Calendar size={16} />
              Période *
            </label>
            <input
              type="month"
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          {/* Revenus */}
          <div className="form-group">
            <label htmlFor="revenue" className="form-label">
              <DollarSign size={16} />
              Revenus (€) *
            </label>
            <input
              type="number"
              id="revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          {/* Dépenses */}
          <div className="form-group">
            <label htmlFor="expenses" className="form-label">
              <DollarSign size={16} />
              Dépenses (€) *
            </label>
            <input
              type="number"
              id="expenses"
              name="expenses"
              value={formData.expenses}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          {/* Trésorerie */}
          <div className="form-group">
            <label htmlFor="cash_balance" className="form-label">
              <DollarSign size={16} />
              Trésorerie (€) *
            </label>
            <input
              type="number"
              id="cash_balance"
              name="cash_balance"
              value={formData.cash_balance}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          {/* Employés */}
          <div className="form-group">
            <label htmlFor="employees" className="form-label">
              <Users size={16} />
              Nombre d'employés
            </label>
            <input
              type="number"
              id="employees"
              name="employees"
              value={formData.employees}
              onChange={handleChange}
              className="form-input"
              min="0"
              placeholder="0"
              disabled={loading}
            />
          </div>

          {/* Salaire moyen */}
          <div className="form-group">
            <label htmlFor="average_salary" className="form-label">
              <DollarSign size={16} />
              Salaire moyen (€)
            </label>
            <input
              type="number"
              id="average_salary"
              name="average_salary"
              value={formData.average_salary}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              min="0"
              placeholder="0.00"
              disabled={loading}
            />
          </div>
        </div>

        {/* Métriques calculées */}
        <div className="calculated-metrics">
          <h4>Métriques calculées</h4>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Bénéfice</span>
              <span className={`metric-value ${metrics.profit >= 0 ? 'positive' : 'negative'}`}>
                {metrics.profit.toFixed(2)} €
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Marge</span>
              <span className={`metric-value ${metrics.profitMargin >= 0 ? 'positive' : 'negative'}`}>
                {metrics.profitMargin}%
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Taux de combustion</span>
              <span className="metric-value">
                {metrics.monthlyBurnRate.toFixed(2)} €/mois
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Trésorerie restante</span>
              <span className={`metric-value ${metrics.runway >= 6 ? 'positive' : metrics.runway >= 3 ? 'warning' : 'negative'}`}>
                {metrics.runway} mois
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <Button
            type="submit"
            disabled={loading}
            icon={loading ? <LoadingSpinner size="small" /> : <Save size={16} />}
          >
            {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Ajouter')}
          </Button>
          
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                period: '',
                revenue: '',
                expenses: '',
                employees: '',
                average_salary: '',
                cash_balance: ''
              })}
              disabled={loading}
            >
              Effacer
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default FinancialDataForm;