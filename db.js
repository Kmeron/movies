const Sequelize = require('sequelize')
const { storagePass } = require('./config')

const sequelize = new Sequelize('sqlite::memory:', {
  dialect: 'sqlite',
  storage: storagePass,
  logging: false
})

module.exports = { sequelize, DT: Sequelize.DataTypes }
