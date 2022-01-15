const jwt = require('jwt-simple')
const { jwtSecret } = require('./config.js')

function checkSession (req, res, next) {
  try {
    const authUser = req.headers.authorization
    if (!authUser) throw new Error()
    const { id, iat } = jwt.decode(authUser, jwtSecret)
    const isIatExpired = (iat + 5 * 60 * 60) - Math.round(Date.now() / 1000)
    if (!id || !isIatExpired) throw new Error()

    res.locals.userId = id
    next()
  } catch {
    res.send({
      status: 0,
      error: {
        fields: {
          token: 'REQUIRED'
        },
        code: 'FORMAT_ERROR'
      }
    })
  }
}

module.exports = { checkSession }
