const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
const Joi = require('joi')
// const ServiceError = require('../../ServiceError.js')

async function importMovies (payload) {
  console.log(payload)
  const movies = payload.buffer.toString()
    .split('\n\n')
    .filter(elem => elem)
    .map(elem => elem.split('\n'))
    .map(elem => elem.map(tag => tag.split(': ')))
    .map(movie => {
      return {
        title: movie[0][1],
        year: +movie[1][1],
        format: movie[2][1],
        actors: movie[3][1].split(', ')
      }
    })

  const transaction = await sequelize.transaction()

  try {
    const isMoviesExist = await Promise.all(movies.map(movie => Movie.findOne({
      where: {
        userId: payload.userId,
        title: movie.title
      },
      transaction
    })))

    const newMovies = []
    for (let i = 0; i <= (isMoviesExist.length - 1); i++) {
      if (!isMoviesExist[i]) {
        newMovies.push(movies[i])
      }
    }

    const actors = newMovies.map(movie => {
      const dumpedActors = movie.actors.map(actor => {
        return { name: actor }
      })
      return dumpedActors
    })

    const actorsInDb = await Promise.all(
      actors.map(async oneMovie => {
        const oneMovieActors = await Promise.all(
          oneMovie.map(acc => Actor.findOne({ where: { name: acc.name }, transaction }))
        )
        return oneMovieActors
      })
    )

    const isNewActors = actorsInDb.flat()
    const allActors = actors.flat()
    const newActors = []
    for (let i = 0; i <= (isNewActors.length - 1); i++) {
      if (!isNewActors[i]) {
        newActors.push(allActors[i])
      }
    }
    const actorsNames = newActors.map(actor => actor.name)
    const nonDuplicated = [...new Set(actorsNames)].map(actor => {
      return { name: actor }
    })

    await Actor.bulkCreate(nonDuplicated, { transaction })
    const bulkMovies = newMovies.map(movie => {
      return { ...movie, userId: payload.userId }
    })
    const createdMovies = await Movie.bulkCreate(bulkMovies, { transaction })

    const actorsForNewMovies = newMovies.map(movie => movie.actors)
    const actorsToSet = await Promise.all(
      actorsForNewMovies.map(async actors => {
        const act = await Promise.all(actors.map(actor => Actor.findOne({ where: { name: actor }, transaction })))
        return act
      })
    )
    const actorIdsToSet = actorsToSet.map(actors => {
      const ids = actors.map(actor => actor.dataValues.id)
      return ids
    })

    await Promise.all(createdMovies.map((movie, i) => {
      return movie.setActors(actorIdsToSet[i], { transaction })
    }))

    await transaction.commit()
    const imported = newMovies.length
    const total = await Movie.count({ where: { userId: payload.userId } })
    const meta = { imported, total }
    const data = createdMovies.map(movie => {
      return {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        format: movie.format,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt
      }
    })

    return { data, meta }
  } catch (error) {
    console.log(error)
    await transaction.rollback()

    throw error
  }
}

const validationRules = {
  userId: Joi.number()
    .integer()
    .positive()
    .required(),
  fieldname: Joi.string()
    .required(),
  originalname: Joi.string()
    .required(),
  encoding: Joi.string()
    .valid('7bit')
    .required(),
  mimetype: Joi.string()
    .valid('text/plain')
    .required(),
  buffer: Joi.binary()
    .required(),
  size: Joi.number()
    .positive()
    .required()
}

module.exports = { service: importMovies, validationRules }
