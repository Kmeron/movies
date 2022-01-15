const Sequelize = require('sequelize')

const sequelize = new Sequelize('sqlite::memory:', {
  dialect: 'sqlite',
  storage: './movies.db'
})

module.exports = { sequelize, DT: Sequelize.DataTypes }