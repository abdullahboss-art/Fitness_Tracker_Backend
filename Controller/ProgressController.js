

const ProgressService = require('../Services/ProgressServices');
const { validateProgressInput, validateBulkProgressInput } = require('../utils/validation');

class ProgressController {
  // Create progress entry
  async createProgress(req, res) {
    try {
      const { error } = validateProgressInput(req.body);
      if (error) {
        return res.status(400).json({ 
          success: false, 
          message: error.details[0].message 
        });
      }

      const progressData = {
        ...req.body,
        userId: req.user.id
      };

      const progress = await progressService.createProgress(progressData);
      
      res.status(201).json({
        success: true,
        message: 'Progress entry created successfully',
        data: progress
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Get dashboard data
  async getDashboard(req, res) {
    try {
      const dashboardData = await ProgressService.getDashboardData(req.user.id);
      
      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Get all progress entries for user
  async getUserProgress(req, res) {
    try {
      const { startDate, endDate, page, limit } = req.query;
      const result = await ProgressService.getUserProgress(
        req.user.id, 
        { startDate, endDate, page, limit }
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Get single progress entry
  async getProgressById(req, res) {
    try {
      const progress = await ProgressService.getProgressById(
        req.params.id, 
        req.user.id
      );

      if (!progress) {
        return res.status(404).json({ 
          success: false, 
          message: 'Progress entry not found' 
        });
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Update progress entry
  async updateProgress(req, res) {
    try {
      const { error } = validateProgressInput(req.body, true);
      if (error) {
        return res.status(400).json({ 
          success: false, 
          message: error.details[0].message 
        });
      }

      const progress = await ProgressService.updateProgress(
        req.params.id,
        req.user.id,
        req.body
      );

      if (!progress) {
        return res.status(404).json({ 
          success: false, 
          message: 'Progress entry not found' 
        });
      }

      res.json({
        success: true,
        message: 'Progress entry updated successfully',
        data: progress
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Delete progress entry
  async deleteProgress(req, res) {
    try {
      const progress = await ProgressService.deleteProgress(
        req.params.id, 
        req.user.id
      );

      if (!progress) {
        return res.status(404).json({ 
          success: false, 
          message: 'Progress entry not found' 
        });
      }

      res.json({
        success: true,
        message: 'Progress entry deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Get progress graphs
  async getProgressGraphs(req, res) {
    try {
      const { metric = 'weight', period = '30' } = req.query;

      const graphs = await ProgressService.generateProgressGraphs(
        req.user.id,
        metric,
        period
      );

      res.json({
        success: true,
        data: graphs
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Get progress summary
  async getProgressSummary(req, res) {
    try {
      const summary = await ProgressService.getProgressSummary(req.user.id);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Bulk create progress entries
  async bulkCreateProgress(req, res) {
    try {
      const { entries } = req.body;
      const { validEntries, errors } = validateBulkProgressInput(entries);

      if (validEntries.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid entries found',
          errors
        });
      }

      const createdEntries = [];
      for (const entry of validEntries) {
        const progress = await ProgressService.createProgress({
          ...entry,
          userId: req.user.id
        });
        createdEntries.push(progress);
      }

      res.status(201).json({
        success: true,
        message: `Created ${createdEntries.length} entries successfully`,
        data: { 
          created: createdEntries,
          errors: errors.length ? errors : undefined 
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new ProgressController();