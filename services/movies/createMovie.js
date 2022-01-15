const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const ServiceError = require('../../ServiceError.js')

async function createMovie (payload) {
  const transaction = await sequelize.transaction()
  try {
    const isMovieExist = await Movie.findOne({
      where: {
        title: payload.title
      }
    }, { transaction })

    if (isMovieExist) {
      throw new ServiceError({
        fields: {
          title: 'NOT_UNIQUE'
        },
        code: 'MOVIE_EXISTS'
      })
    }

    const actors = payload.actors.map(actor => {
      return { name: actor }
    })
    const movie = { ...payload, actors }

    const createdMovie = await Movie.create(movie, { include: [{ model: Actor, as: 'actors' }] }, { transaction })

    const data = {
      id: createdMovie.id,
      title: createdMovie.title,
      year: createdMovie.year,
      format: createdMovie.format,
      actors: createdMovie.actors.map(actor => {
        return {
          id: actor.id,
          name: actor.name,
          createdAt: actor.createdAt,
          updatedAt: actor.updatedAt
        }
      }),
      createdAt: createdMovie.createdAt,
      updatedAt: createdMovie.updatedAt
    }

    await transaction.commit()

    return { data }
  } catch (error) {
    await transaction.rollback()

    throw error
  }
}

module.exports = { service: createMovie }
