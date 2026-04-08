const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  warden_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  complaint_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  block: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  room_no_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved', 'Rejected'),
    defaultValue: 'Pending',
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Low',
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assigned_at: {
    type: DataTypes.DATE,
  },
  resolved_at: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
});

Complaint.belongsTo(User, { as: 'Student', foreignKey: 'student_id' });
Complaint.belongsTo(User, { as: 'Warden', foreignKey: 'warden_id' });
Complaint.belongsTo(User, { as: 'Staff', foreignKey: 'staff_id' });

module.exports = Complaint;
