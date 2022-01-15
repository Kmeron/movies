const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const ServiceError = require('../../ServiceError')

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

    const data = {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      format: movie.format,
      actors: movie.actors.map(actor => {
        return {
          id: actor.id,
          name: actor.name,
          createdAt: actor.createdAt,
          updatedAt: actor.updatedAt
        }
      }),
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt
    }

    console.log(movie)
    await transaction.commit()
    return { data }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = { service: showMovie }
