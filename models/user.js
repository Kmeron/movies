const { sequelize, DT } = require('../db.js')

const User = sequelize.define('user', {
  id: {
    type: DT.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DT.STRING,
    allowNull: false
  },
  email: {
    type: DT.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DT.STRING,
    allowNull: false
  }
})

function initUserRelations () {
  const Movie = sequelize.model('movie')
  User.hasMany(Movie, {
    foreignKey: 'userId',
    onDelete: 'cascade'
  })
}

module.exports = { User, initUserRelations }
