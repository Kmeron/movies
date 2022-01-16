const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const ServiceError = require('../../ServiceError.js')

async function importMovies (movies) {
  console.log(movies)
  // const transaction = await sequelize.transaction()

  // try {
  //   const createdNotes = await Movie.bulkCreate(movies, { transaction })

  //   await transaction.commit()
  //   return createdNotes.map(note => dumpNote(note))
  // } catch (error) {
  //   await transaction.rollback()

  //   if (error.code === 'ER_PARSE_ERROR') {
  //     throw new ServiceError({
  //       message: 'Provided invalid data for creating note',
  //       code: 'INVALID_DATA'
  //     })
  //   }
  //   throw error
  // }
}

module.exports = { importMovies }
