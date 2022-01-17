const { sequelize } = require('../../db.js')
const { Movie } = require('../../models/movie.js')
const ServiceError = require('../../ServiceError.js')

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
    // .map(elem => {
    //   const tagValue = elem.split(': ')
    //   let tag

  //   if (tagValue[0] === 'Title') {
  //     tag = { title: tagValue[1] }
  //   } else if (tagValue[0] === 'Release Year') {
  //     tag = { year: +tagValue[1] }
  //   } else if (tagValue[0] === 'Format') {
  //     tag = { format: tagValue[1] }
  //   } else if (tagValue[0] === 'Stars') {
  //     tag = { actors: tagValue[1].split(', ') }
  //   }
  //   return tag
  // })

  console.log(movies)
  return {}
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

module.exports = { service: importMovies }
