const sequelize = require('./db')
const user = require('./models/user')
const movie = require('./models/movie')
const actor = require('./models/actor')

const models = {
  User: user.User,
  Movie: movie.Movie,
  Actor: actor.Actor
}

const initRelationModels = [user.initUserRelations, movie.initMovieRelations, actor.initActorRelations]

initRelationModels.forEach(initRelations => initRelations())

module.exports = { ...sequelize, ...models }
