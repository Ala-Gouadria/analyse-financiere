const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Helper pour l'export de données en différents formats
 */
class ExportHelper {
  /**
   * Générer un PDF de rapport d'analyse
   */
  static async generateAnalysisPDF(analysis, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          info: {
            Title: `Rapport d'analyse - ${analysis.project_name}`,
            Author: 'Système d\'Analyse Financière',
            Subject: 'Analyse financière détaillée',
            Keywords: 'finance, analyse, risque, recommandation',
            Creator: 'Analyse Financière API',
            CreationDate: new Date()
          }
        });

        const chunks = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // En-tête du document
        this.addPDFHeader(doc, analysis);
        
        // Résumé exécutif
        this.addExecutiveSummary(doc, analysis);
        
        // Analyse des risques
        this.addRiskAnalysis(doc, analysis);
        
        // Recommandations
        this.addRecommendations(doc, analysis);
        
        // Prévisions
        this.addForecast(doc, analysis);
        
        // Pied de page
        this.addPDFFooter(doc, analysis);

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Ajouter l'en-tête du PDF
   */
  static addPDFHeader(doc, analysis) {
    // Logo ou titre
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('RAPPORT D\'ANALYSE FINANCIÈRE', 50, 50, { align: 'center' });
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#7f8c8d')
       .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, 80, { align: 'center' });
    
    // Ligne de séparation
    doc.moveTo(50, 110)
       .lineTo(545, 110)
       .strokeColor('#bdc3c7')
       .lineWidth(1)
       .stroke();
    
    // Informations du projet
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Informations du Projet', 50, 130);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#34495e')
       .text(`Projet: ${analysis.project_name}`, 50, 155)
       .text(`Date d'analyse: ${new Date(analysis.analysis_date).toLocaleDateString('fr-FR')}`, 50, 170)
       .text(`Niveau de risque: ${analysis.risk_level?.toUpperCase() || 'NON DÉTERMINÉ'}`, 50, 185);
    
    doc.moveDown(2);
  }

  /**
   * Ajouter le résumé exécutif
   */
  static addExecutiveSummary(doc, analysis) {
    const startY = 220;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('RÉSUMÉ EXÉCUTIF', 50, startY);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#34495e')
       .text(analysis.summary?.overview || 'Aucun résumé disponible.', 50, startY + 25, {
         width: 495,
         align: 'justify'
       });
    
    // Métriques clés
    if (analysis.calculated_metrics) {
      const metrics = analysis.calculated_metrics;
      const metricsY = startY + 60;
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('MÉTRIQUES CLÉS:', 50, metricsY);
      
      doc.fontSize(9)
         .font('Helvetica')
         .text(`• Marge bénéficiaire: ${metrics.profit_margin?.toFixed(1)}%`, 70, metricsY + 20)
         .text(`• Trésorerie restante: ${metrics.cash_runway_months} mois`, 70, metricsY + 35)
         .text(`• Profit mensuel: ${metrics.absolute_profit?.toFixed(2)} €`, 70, metricsY + 50);
    }
    
    doc.addPage();
  }

  /**
   * Ajouter l'analyse des risques
   */
  static addRiskAnalysis(doc, analysis) {
    const startY = 50;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('ANALYSE DES RISQUES', 50, startY);
    
    if (!analysis.risks || analysis.risks.length === 0) {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#7f8c8d')
         .text('Aucun risque identifié.', 50, startY + 25);
      return;
    }

    let currentY = startY + 30;
    
    analysis.risks.forEach((risk, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      const riskColor = this.getRiskColor(risk.level);
      
      // En-tête du risque
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(riskColor)
         .text(`${index + 1}. ${risk.description}`, 50, currentY);
      
      // Détails du risque
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#34495e')
         .text(`Niveau: ${risk.level.toUpperCase()} | Impact: ${risk.impact} | Probabilité: ${risk.probability}`, 70, currentY + 15);
      
      // Mesure d'atténuation
      doc.text(`Atténuation: ${risk.mitigation}`, 70, currentY + 30, {
        width: 475
      });
      
      currentY += 55;
    });
    
    doc.addPage();
  }

  /**
   * Ajouter les recommandations
   */
  static addRecommendations(doc, analysis) {
    const startY = 50;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('RECOMMANDATIONS', 50, startY);
    
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#7f8c8d')
         .text('Aucune recommandation disponible.', 50, startY + 25);
      return;
    }

    let currentY = startY + 30;
    
    analysis.recommendations.forEach((rec, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      const priorityColor = this.getPriorityColor(rec.priority);
      
      // Titre de la recommandation
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(`${index + 1}. ${rec.title}`, 50, currentY);
      
      // Priorité
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor(priorityColor)
         .text(`Priorité: ${rec.priority.toUpperCase()}`, 70, currentY + 15);
      
      // Description
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#34495e')
         .text(rec.description, 70, currentY + 30, {
           width: 475
         });
      
      // Étapes d'action
      if (rec.action_steps && rec.action_steps.length > 0) {
        doc.text('Étapes d\'action:', 70, currentY + 55);
        rec.action_steps.forEach((step, stepIndex) => {
          doc.text(`  ${stepIndex + 1}. ${step}`, 85, currentY + 70 + (stepIndex * 12));
        });
        currentY += rec.action_steps.length * 12;
      }
      
      currentY += 85;
    });
  }

  /**
   * Ajouter les prévisions
   */
  static addForecast(doc, analysis) {
    if (!analysis.forecast) return;
    
    doc.addPage();
    const startY = 50;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('PRÉVISIONS ET PERSPECTIVES', 50, startY);
    
    if (analysis.forecast.next_3_months) {
      const forecast = analysis.forecast.next_3_months;
      let currentY = startY + 30;
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('3 PROCHAINS MOIS:', 50, currentY);
      
      doc.fontSize(9)
         .font('Helvetica')
         .text(`• Tendance revenus: ${forecast.revenue_trend}`, 70, currentY + 20)
         .text(`• Perspective rentabilité: ${forecast.profitability_outlook}`, 70, currentY + 35)
         .text(`• Projection trésorerie: ${forecast.cash_flow_projection}`, 70, currentY + 50);
      
      currentY += 70;
      
      // Opportunités de croissance
      if (analysis.forecast.growth_opportunities?.length > 0) {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('OPPORTUNITÉS DE CROISSANCE:', 50, currentY);
        
        analysis.forecast.growth_opportunities.forEach((opportunity, index) => {
          doc.fontSize(9)
             .font('Helvetica')
             .text(`• ${opportunity}`, 70, currentY + 20 + (index * 15));
        });
        
        currentY += analysis.forecast.growth_opportunities.length * 15 + 30;
      }
      
      // Avertissements
      if (analysis.forecast.warnings?.length > 0) {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#e74c3c')
           .text('AVERTISSEMENTS:', 50, currentY);
        
        analysis.forecast.warnings.forEach((warning, index) => {
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#e74c3c')
             .text(`• ${warning}`, 70, currentY + 20 + (index * 15));
        });
      }
    }
  }

  /**
   * Ajouter le pied de page
   */
  static addPDFFooter(doc, analysis) {
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#7f8c8d')
         .text(
           `Page ${i + 1} sur ${pageCount} | Généré par Analyse Financière API | ${new Date().toLocaleDateString('fr-FR')}`,
           50,
           780,
           { align: 'center' }
         );
    }
  }

  /**
   * Générer un fichier Excel avec les données financières
   */
  static async generateFinancialExcel(financialData, projectName) {
    const workbook = new ExcelJS.Workbook();
    
    // Propriétés du document
    workbook.creator = 'Analyse Financière API';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastModifiedBy = 'Analyse Financière API';
    workbook.title = `Données financières - ${projectName}`;
    workbook.subject = 'Données financières export';
    workbook.keywords = 'finance, données, export';
    workbook.category = 'Financial Data';
    workbook.description = 'Export des données financières au format Excel';
    workbook.company = 'Analyse Financière';

    // Feuille de données principales
    const dataSheet = workbook.addWorksheet('Données Financières');
    
    // En-têtes
    dataSheet.columns = [
      { header: 'Période', key: 'period', width: 15 },
      { header: 'Revenus (€)', key: 'revenue', width: 15 },
      { header: 'Dépenses (€)', key: 'expenses', width: 15 },
      { header: 'Bénéfice (€)', key: 'profit', width: 15 },
      { header: 'Marge (%)', key: 'profit_margin', width: 12 },
      { header: 'Employés', key: 'employees', width: 12 },
      { header: 'Salaire Moyen (€)', key: 'average_salary', width: 18 },
      { header: 'Trésorerie (€)', key: 'cash_balance', width: 15 }
    ];

    // Données
    financialData.forEach(data => {
      dataSheet.addRow({
        period: new Date(data.period).toLocaleDateString('fr-FR'),
        revenue: parseFloat(data.revenue),
        expenses: parseFloat(data.expenses),
        profit: parseFloat(data.revenue) - parseFloat(data.expenses),
        profit_margin: parseFloat(data.profit_margin),
        employees: parseInt(data.employees),
        average_salary: parseFloat(data.average_salary),
        cash_balance: parseFloat(data.cash_balance)
      });
    });

    // Style de l'en-tête
    const headerRow = dataSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2c3e50' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Format des nombres
    dataSheet.getColumn('revenue').numFmt = '#,##0.00 €';
    dataSheet.getColumn('expenses').numFmt = '#,##0.00 €';
    dataSheet.getColumn('profit').numFmt = '#,##0.00 €';
    dataSheet.getColumn('average_salary').numFmt = '#,##0.00 €';
    dataSheet.getColumn('cash_balance').numFmt = '#,##0.00 €';
    dataSheet.getColumn('profit_margin').numFmt = '0.00 %';

    // Feuille de résumé
    const summarySheet = workbook.addWorksheet('Résumé');
    
    // Calcul des totaux et moyennes
    const totalRevenue = financialData.reduce((sum, data) => sum + parseFloat(data.revenue), 0);
    const totalExpenses = financialData.reduce((sum, data) => sum + parseFloat(data.expenses), 0);
    const totalProfit = totalRevenue - totalExpenses;
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    summarySheet.columns = [
      { header: 'Métrique', key: 'metric', width: 25 },
      { header: 'Valeur', key: 'value', width: 20 }
    ];

    const summaryData = [
      { metric: 'Période couverte', value: `${financialData.length} mois` },
      { metric: 'Revenus totaux', value: totalRevenue },
      { metric: 'Dépenses totales', value: totalExpenses },
      { metric: 'Bénéfice total', value: totalProfit },
      { metric: 'Marge bénéficiaire moyenne', value: avgProfitMargin / 100 },
      { metric: 'Dernière période', value: new Date(financialData[financialData.length - 1]?.period).toLocaleDateString('fr-FR') },
      { metric: 'Date d\'export', value: new Date().toLocaleDateString('fr-FR') }
    ];

    summaryData.forEach(data => {
      summarySheet.addRow(data);
    });

    // Style de la feuille de résumé
    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF27ae60' }
    };

    summarySheet.getColumn('value').numFmt = '#,##0.00 €';
    summarySheet.getCell('B5').numFmt = '0.00 %'; // Marge bénéficiaire

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Obtenir la couleur selon le niveau de risque
   */
  static getRiskColor(riskLevel) {
    const colors = {
      critical: '#e74c3c',
      high: '#e67e22',
      medium: '#f39c12',
      low: '#27ae60'
    };
    return colors[riskLevel] || '#7f8c8d';
  }

  /**
   * Obtenir la couleur selon la priorité
   */
  static getPriorityColor(priority) {
    const colors = {
      critical: '#e74c3c',
      high: '#e67e22',
      medium: '#f39c12',
      low: '#27ae60'
    };
    return colors[priority] || '#7f8c8d';
  }

  /**
   * Formater les données pour l'export CSV
   */
  static formatDataForCSV(data, headers) {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Échapper les virgules et guillemets
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  /**
   * Valider les données avant l'export
   */
  static validateExportData(data, format) {
    if (!data || data.length === 0) {
      throw new Error('Aucune donnée à exporter');
    }

    if (format === 'excel' && data.length > 100000) {
      throw new Error('Trop de données pour l\'export Excel (limite: 100,000 lignes)');
    }

    return true;
  }
}

module.exports = ExportHelper;