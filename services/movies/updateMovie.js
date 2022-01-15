const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const ServiceError = require('../../ServiceError')
// const { Op } = require('sequelize')

async function updateMovie ({ userId, ...movie }) {
  const transaction = await sequelize.transaction()

  try {
    const isMovieExist = await Movie.findOne({
      where: {
        userId,
        id: movie.id
      }
    }, { transaction })

    if (!isMovieExist) {
      throw new ServiceError({
        fields: {
          id: movie.id
        },
        code: 'MOVIE_NOT_FOUND'
      })
    }

    const actors = movie.actors.map(actor => {
      return { name: actor }
    })

    await Movie.update({
      title: movie.title,
      year: movie.year,
      format: movie.format
    }, {
      where: {
        userId,
        id: movie.id
      },
      include: [{
        model: Actor,
        as: 'actors'
      }]
    }, { transaction }) // returns [0] or [1]

    const updatedMovie = await Movie.findOne({
      where: {
        userId,
        id: movie.id
      }
    }, { transaction })
    console.log(updatedMovie)

    const res = updatedMovie.getActors({ where: { movieId: movie.id } }, { transaction })// What is going on here??
    console.log(res)

    await transaction.commit()

    return {}
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = { service: updateMovie }
