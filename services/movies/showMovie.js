const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const ServiceError = require('../../ServiceError')
const dumpMovie = require('./dumpMovie.js')

async function showMovie ({ id, userId }) {
  const transaction = await sequelize.transaction()

  try {
    const movie = await Movie.findOne({
      where: {
        userId,
        id
      },
      include: [{
        model: Actor,
        as: 'actors'
      }]
    }, { transaction })

    if (!movie) {
      throw new ServiceError({
        fields: {
          id
        },
        code: 'MOVIE_NOT_FOUND'
      })
    }

    const data = dumpMovie(movie)

    console.log(movie)
    await transaction.commit()
    return { data }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = { service: showMovie }
