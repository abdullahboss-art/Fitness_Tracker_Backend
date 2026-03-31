// const Progress = require('../Models/ProgressModel');

// class ProgressService {
//   // Create new progress entry
//   async createProgress(progressData) {
//     try {
//       const progress = new Progress(progressData);
//       return await progress.save();
//     } catch (error) {
//       throw new Error(`Error creating progress: ${error.message}`);
//     }
//   }

//   // Get all progress entries for a user
//   async getUserProgress(userId, startDate = null, endDate = null) {
//     try {
//       const query = { userId };
      
//       if (startDate || endDate) {
//         query.date = {};
//         if (startDate) query.date.$gte = new Date(startDate);
//         if (endDate) query.date.$lte = new Date(endDate);
//       }

//       return await Progress.find(query)
//         .sort({ date: -1 })
//         .lean();
//     } catch (error) {
//       throw new Error(`Error fetching progress: ${error.message}`);
//     }
//   }

//   // Get single progress entry
//   async getProgressById(progressId, userId) {
//     try {
//       return await Progress.findOne({ 
//         _id: progressId, 
//         userId 
//       }).lean();
//     } catch (error) {
//       throw new Error(`Error fetching progress: ${error.message}`);
//     }
//   }

//   // Update progress entry
//   async updateProgress(progressId, userId, updateData) {
//     try {
//       return await Progress.findOneAndUpdate(
//         { _id: progressId, userId },
//         { $set: updateData },
//         { new: true, runValidators: true }
//       ).lean();
//     } catch (error) {
//       throw new Error(`Error updating progress: ${error.message}`);
//     }
//   }

//   // Delete progress entry
//   async deleteProgress(progressId, userId) {
//     try {
//       return await Progress.findOneAndDelete({ 
//         _id: progressId, 
//         userId 
//       });
//     } catch (error) {
//       throw new Error(`Error deleting progress: ${error.message}`);
//     }
//   }

//   // Generate progress data for graphs
//   async generateProgressGraphs(userId, metric, period = '30') {
//     try {
//       const days = parseInt(period);
//       const startDate = new Date();
//       startDate.setDate(startDate.getDate() - days);

//       const progressData = await Progress.find({
//         userId,
//         date: { $gte: startDate }
//       }).sort({ date: 1 }).lean();

//       // Format data for charts
//       const graphData = {
//         labels: [],
//         datasets: [{
//           label: this.getMetricLabel(metric),
//           data: [],
//           borderColor: 'rgb(75, 192, 192)',
//           backgroundColor: 'rgba(75, 192, 192, 0.2)',
//           tension: 0.1
//         }]
//       };

//       progressData.forEach(entry => {
//         graphData.labels.push(entry.date.toISOString().split('T')[0]);
        
//         let value = null;
//         if (metric === 'weight') {
//           value = entry.weight;
//         } else if (metric.startsWith('measurements.')) {
//           const measurementField = metric.split('.')[1];
//           value = entry.measurements?.[measurementField];
//         } else if (metric.startsWith('performance.')) {
//           const performanceField = metric.split('.')[1];
//           value = entry.performance?.[performanceField];
//         }

//         graphData.datasets[0].data.push(value);
//       });

//       // Calculate statistics
//       const stats = this.calculateStats(graphData.datasets[0].data);

//       return { graphData, stats };
//     } catch (error) {
//       throw new Error(`Error generating graphs: ${error.message}`);
//     }
//   }

//   // Get summary statistics
//   async getProgressSummary(userId) {
//     try {
//       const allProgress = await Progress.find({ userId })
//         .sort({ date: -1 })
//         .lean();

//       if (allProgress.length === 0) {
//         return { message: 'No progress data found' };
//       }

//       const latest = allProgress[0];
//       const oldest = allProgress[allProgress.length - 1];
//       const totalEntries = allProgress.length;

//       // Calculate changes
//       const changes = {
//         weight: {
//           current: latest.weight,
//           start: oldest.weight,
//           change: (latest.weight - oldest.weight).toFixed(1)
//         }
//       };

//       // Add measurement changes if available
//       if (latest.measurements && oldest.measurements) {
//         changes.measurements = {};
//         Object.keys(latest.measurements).forEach(key => {
//           if (latest.measurements[key] && oldest.measurements[key]) {
//             changes.measurements[key] = {
//               current: latest.measurements[key],
//               start: oldest.measurements[key],
//               change: (latest.measurements[key] - oldest.measurements[key]).toFixed(1)
//             };
//           }
//         });
//       }

//       // Add performance changes if available
//       if (latest.performance && oldest.performance) {
//         changes.performance = {};
//         Object.keys(latest.performance).forEach(key => {
//           if (latest.performance[key] && oldest.performance[key]) {
//             changes.performance[key] = {
//               current: latest.performance[key],
//               start: oldest.performance[key],
//               change: (latest.performance[key] - oldest.performance[key]).toFixed(1)
//             };
//           }
//         });
//       }

//       return {
//         totalEntries,
//         firstEntry: oldest.date,
//         latestEntry: latest.date,
//         changes
//       };
//     } catch (error) {
//       throw new Error(`Error generating summary: ${error.message}`);
//     }
//   }

//   // Helper: Get metric label
//   getMetricLabel(metric) {
//     const labels = {
//       'weight': 'Weight (kg)',
//       'measurements.chest': 'Chest (cm)',
//       'measurements.waist': 'Waist (cm)',
//       'measurements.hips': 'Hips (cm)',
//       'measurements.arms': 'Arms (cm)',
//       'measurements.thighs': 'Thighs (cm)',
//       'measurements.calves': 'Calves (cm)',
//       'performance.runTime': 'Run Time (seconds)',
//       'performance.runDistance': 'Run Distance (km)',
//       'performance.benchPress': 'Bench Press (kg)',
//       'performance.squat': 'Squat (kg)',
//       'performance.deadlift': 'Deadlift (kg)'
//     };
//     return labels[metric] || metric;
//   }

//   // Helper: Calculate statistics
//   calculateStats(data) {
//     const validData = data.filter(val => val !== null && val !== undefined);
    
//     if (validData.length === 0) {
//       return { average: 0, min: 0, max: 0, total: 0 };
//     }

//     const sum = validData.reduce((a, b) => a + b, 0);
//     const average = sum / validData.length;
//     const min = Math.min(...validData);
//     const max = Math.max(...validData);

//     return {
//       average: average.toFixed(1),
//       min: min.toFixed(1),
//       max: max.toFixed(1),
//       total: validData.length
//     };
//   }
// }

// module.exports = new ProgressService();

const Progress = require('../Models/ProgressModel');

class ProgressService {
  // Create new progress entry
  async createProgress(progressData) {
    try {
      const progress = new Progress(progressData);
      return await progress.save();
    } catch (error) {
      throw new Error(`Error creating progress: ${error.message}`);
    }
  }

  // Get all progress entries for a user with pagination
  async getUserProgress(userId, options = {}) {
    try {
      const { startDate, endDate, page = 1, limit = 10 } = options;
      
      const query = { userId };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [progress, total] = await Promise.all([
        Progress.find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Progress.countDocuments(query)
      ]);

      return {
        data: progress,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      throw new Error(`Error fetching progress: ${error.message}`);
    }
  }

  // Get single progress entry
  async getProgressById(progressId, userId) {
    try {
      return await Progress.findOne({ 
        _id: progressId, 
        userId 
      }).lean();
    } catch (error) {
      throw new Error(`Error fetching progress: ${error.message}`);
    }
  }

  // Update progress entry
  async updateProgress(progressId, userId, updateData) {
    try {
      return await Progress.findOneAndUpdate(
        { _id: progressId, userId },
        { $set: updateData },
        { new: true, runValidators: true }
      ).lean();
    } catch (error) {
      throw new Error(`Error updating progress: ${error.message}`);
    }
  }

  // Delete progress entry
  async deleteProgress(progressId, userId) {
    try {
      return await Progress.findOneAndDelete({ 
        _id: progressId, 
        userId 
      });
    } catch (error) {
      throw new Error(`Error deleting progress: ${error.message}`);
    }
  }

  // Generate progress data for graphs
  async generateProgressGraphs(userId, metric, period = '30') {
    try {
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const progressData = await Progress.find({
        userId,
        date: { $gte: startDate }
      }).sort({ date: 1 }).lean();

      // Format data for charts
      const labels = [];
      const values = [];

      progressData.forEach(entry => {
        labels.push(new Date(entry.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        }));
        
        let value = null;
        if (metric === 'weight') {
          value = entry.weight;
        } else if (metric.startsWith('measurements.')) {
          const measurementField = metric.split('.')[1];
          value = entry.measurements?.[measurementField];
        } else if (metric.startsWith('performance.')) {
          const performanceField = metric.split('.')[1];
          value = entry.performance?.[performanceField];
        }

        values.push(value);
      });

      // Calculate statistics
      const validValues = values.filter(v => v !== null && v !== undefined);
      const stats = {
        avg: validValues.length ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1) : 0,
        min: validValues.length ? Math.min(...validValues).toFixed(1) : 0,
        max: validValues.length ? Math.max(...validValues).toFixed(1) : 0,
        total: validValues.length
      };

      return {
        labels,
        values,
        stats,
        metric: this.getMetricLabel(metric)
      };
    } catch (error) {
      throw new Error(`Error generating graphs: ${error.message}`);
    }
  }

  // Get summary statistics
  async getProgressSummary(userId) {
    try {
      const allProgress = await Progress.find({ userId })
        .sort({ date: -1 })
        .lean();

      if (allProgress.length === 0) {
        return {
          totalEntries: 0,
          message: 'No progress data found'
        };
      }

      const latest = allProgress[0];
      const oldest = allProgress[allProgress.length - 1];
      
      // Calculate stats
      const weights = allProgress.map(p => p.weight);
      const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

      // Calculate changes
      const changes = {
        weight: {
          current: latest.weight,
          previous: allProgress[1]?.weight || latest.weight,
          start: oldest.weight,
          change: (latest.weight - oldest.weight).toFixed(1),
          percentage: (((latest.weight - oldest.weight) / oldest.weight) * 100).toFixed(1)
        }
      };

      // Calculate streaks
      let currentStreak = 1;
      for (let i = 1; i < allProgress.length; i++) {
        const prevDate = new Date(allProgress[i-1].date);
        const currDate = new Date(allProgress[i].date);
        const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3) currentStreak++;
        else break;
      }

      return {
        totalEntries: allProgress.length,
        currentStreak,
        avgWeight: avgWeight.toFixed(1),
        firstEntry: oldest.date,
        latestEntry: latest.date,
        changes,
        recentEntries: allProgress.slice(0, 5)
      };
    } catch (error) {
      throw new Error(`Error generating summary: ${error.message}`);
    }
  }

  // Get dashboard data
  async getDashboardData(userId) {
    try {
      const [summary, recent, graphs] = await Promise.all([
        this.getProgressSummary(userId),
        this.getUserProgress(userId, { limit: 5 }),
        this.generateProgressGraphs(userId, 'weight', '30')
      ]);

      return {
        stats: {
          totalEntries: summary.totalEntries,
          currentStreak: summary.currentStreak,
          avgWeight: summary.avgWeight,
          totalChange: summary.changes?.weight?.change || 0
        },
        recentEntries: recent.data,
        weightGraph: graphs,
        summary
      };
    } catch (error) {
      throw new Error(`Error getting dashboard: ${error.message}`);
    }
  }

  // Helper: Get metric label
  getMetricLabel(metric) {
    const labels = {
      'weight': 'Weight (kg)',
      'measurements.chest': 'Chest (cm)',
      'measurements.waist': 'Waist (cm)',
      'measurements.hips': 'Hips (cm)',
      'measurements.arms': 'Arms (cm)',
      'measurements.thighs': 'Thighs (cm)',
      'measurements.calves': 'Calves (cm)',
      'performance.runTime': 'Run Time (sec)',
      'performance.runDistance': 'Run Distance (km)',
      'performance.benchPress': 'Bench Press (kg)',
      'performance.squat': 'Squat (kg)',
      'performance.deadlift': 'Deadlift (kg)'
    };
    return labels[metric] || metric;
  }
}

module.exports = new ProgressService();