const { sequelize, DT } = require('../db.js')

const Actor = sequelize.define('actor', {
  id: {
    type: DT.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DT.STRING,
    allowNull: false,
    unique: true
  }
})

function initActorRelations () {
  const Movie = sequelize.model('movie')
  Actor.belongsToMany(Movie, {
    as: 'movies',
    through: 'movie_actor',
    foreignKey: 'actorId'
  })
}

module.exports = { Actor, initActorRelations }
