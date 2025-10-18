const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Contrôleur pour créer un nouveau projet
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  const newProject = await db.query(
    `INSERT INTO projects (user_id, name, description) 
     VALUES ($1, $2, $3) 
     RETURNING id, name, description, created_at`,
    [userId, name, description || '']
  );

  res.status(201).json({
    success: true,
    message: 'Projet créé avec succès',
    data: {
      project: newProject.rows[0]
    }
  });
});

/**
 * Contrôleur pour récupérer tous les projets d'un utilisateur
 */
const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const projectsResult = await db.query(
    `SELECT p.*, 
            COUNT(fd.id) as data_count,
            MAX(fd.period) as last_data_date
     FROM projects p
     LEFT JOIN financial_data fd ON p.id = fd.project_id
     WHERE p.user_id = $1
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [userId]
  );

  res.json({
    success: true,
    data: {
      projects: projectsResult.rows.map(project => ({
        ...project,
        data_count: parseInt(project.data_count),
        has_data: project.data_count > 0
      }))
    }
  });
});

/**
 * Contrôleur pour récupérer un projet spécifique
 */
const getProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const userId = req.user.id;

  const projectResult = await db.query(
    `SELECT p.*, 
            COUNT(fd.id) as data_count,
            MAX(fd.period) as last_data_date
     FROM projects p
     LEFT JOIN financial_data fd ON p.id = fd.project_id
     WHERE p.id = $1 AND p.user_id = $2
     GROUP BY p.id`,
    [projectId, userId]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Projet non trouvé'
    });
  }

  const project = projectResult.rows[0];

  // Récupérer les données financières récentes
  const financialData = await db.query(
    `SELECT * FROM financial_data 
     WHERE project_id = $1 
     ORDER BY period DESC 
     LIMIT 12`,
    [projectId]
  );

  // Récupérer les analyses récentes
  const recentAnalyses = await db.query(
    `SELECT * FROM analysis_results 
     WHERE project_id = $1 
     ORDER BY analysis_date DESC 
     LIMIT 5`,
    [projectId]
  );

  res.json({
    success: true,
    data: {
      project: {
        ...project,
        data_count: parseInt(project.data_count),
        has_data: project.data_count > 0
      },
      recent_financial_data: financialData.rows,
      recent_analyses: recentAnalyses.rows
    }
  });
});

/**
 * Contrôleur pour mettre à jour un projet
 */
const updateProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const { name, description } = req.body;

  const updateFields = [];
  const updateValues = [];
  let paramCount = 1;

  if (name) {
    updateFields.push(`name = $${paramCount}`);
    updateValues.push(name);
    paramCount++;
  }

  if (description !== undefined) {
    updateFields.push(`description = $${paramCount}`);
    updateValues.push(description);
    paramCount++;
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Aucune donnée à mettre à jour'
    });
  }

  updateValues.push(projectId);

  const updatedProject = await db.query(
    `UPDATE projects 
     SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING id, name, description, created_at`,
    updateValues
  );

  if (updatedProject.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Projet non trouvé'
    });
  }

  res.json({
    success: true,
    message: 'Projet mis à jour avec succès',
    data: {
      project: updatedProject.rows[0]
    }
  });
});

/**
 * Contrôleur pour supprimer un projet
 */
const deleteProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;

  const deletedProject = await db.query(
    'DELETE FROM projects WHERE id = $1 RETURNING id, name',
    [projectId]
  );

  if (deletedProject.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Projet non trouvé'
    });
  }

  res.json({
    success: true,
    message: 'Projet supprimé avec succès',
    data: {
      project: deletedProject.rows[0]
    }
  });
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
};