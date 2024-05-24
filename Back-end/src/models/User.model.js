const Sequelize = require('sequelize');
const sequelize = require('../configs/database');

const UserModel = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    allowNotify: {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = UserModel;
