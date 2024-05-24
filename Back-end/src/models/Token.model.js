const Sequelize = require('sequelize');
const sequelize = require('../configs/database');

const TokenModel = sequelize.define(
  'token',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    // userId: {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'user',
    //     key: 'id',
    //   },
    // },
    token: {
      type: Sequelize.STRING(1024),
      allowNull: false,
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// TokenModel.sync({ alter: true });

module.exports = TokenModel;
