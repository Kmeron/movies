const { sequelize, DT } = require('../db.js')

const Movie = sequelize.define('movie', {
  id: {
    type: DT.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DT.STRING,
    allowNull: false,
    unique: true
  },
  year: {
    type: DT.INTEGER,
    allowNull: false
  },
  format: {
    type: DT.STRING,
    allowNull: false
  },
  userId: {
    type: DT.INTEGER,
    allowNull: false
  }
})

function initMovieRelations () {
  const User = sequelize.model('user')
  const Actor = sequelize.model('actor')
  Movie.belongsTo(User, {
    foreignKey: 'userId'
  })
  Movie.belongsToMany(Actor, {
    as: 'actors',
    through: 'movie_actor',
    foreignKey: 'movieId'
  })
}

module.exports = { Movie, initMovieRelations }
