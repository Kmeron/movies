function dumpMovie (movie) {
  return {
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
}

module.exports = dumpMovie
