const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const { Actor } = require('../../models/actor')
// const ServiceError = require('../../ServiceError.js')
// const dumpMovie = require('./dumpMovie.js')

async function importMovies (payload) {
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
      const actorsArr = movie.actors.map(actor => {
        return { name: actor }
      })
      return actorsArr
    })

    const arr = await Promise.all(
      actors.map(async oneArr => {
        const oneMovieArr = await Promise.all(
          oneArr.map(acc => Actor.findOne({ where: { name: acc.name }, transaction }))
        )
        return oneMovieArr
      })
    )

    const isNewActors = arr.flat()
    const allActors = actors.flat()
    const newActors = []
    for (let i = 0; i <= (isNewActors.length - 1); i++) {
      if (!isNewActors[i]) {
        newActors.push(allActors[i])
      }
    }
    const actorStrArr = newActors.map(ac => ac.name)
    const nonDuplicated = [...new Set(actorStrArr)].map(acc => {
      return { name: acc }
    })

    await Actor.bulkCreate(nonDuplicated, { transaction })
    const bulkMovies = newMovies.map(movie => {
      return { ...movie, userId: payload.userId }
    })
    const createdMovies = await Movie.bulkCreate(bulkMovies, { transaction })

    const actorsForNewMovies = newMovies.map(movie => movie.actors)
    const actorsToSet = await Promise.all(
      actorsForNewMovies.map(async actArr => {
        const act = await Promise.all(actArr.map(actor => Actor.findOne({ where: { name: actor }, transaction })))
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

module.exports = { service: importMovies }
