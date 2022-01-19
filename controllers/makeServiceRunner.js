const ServiceError = require('../ServiceError')
const ValidationError = require('../ValidationError')
const Joi = require('joi')

function makeServiceRunner ({ service, validationRules }, dumpData) {
  return async (req, res) => {
    const payload = dumpData(req, res)
    const schema = Joi.object(validationRules)

    try {
      const data = await schema.validateAsync(payload, { abortEarly: false })
      const promise = await service(data)
      await successResponseToClient(res, promise)
    } catch (error) {
      if (error.name === 'ValidationError') {
        // eslint-disable-next-line no-ex-assign
        error = new ValidationError({
          fields: {
            values: error.details.map(e => e.path[0])
          },
          code: 'INVALID_REQUEST_DATA'
        })
      }
      errorResponseToClient(res, error)
    }
  }
}

async function successResponseToClient (res, promise) {
  const result = await promise
  res.send({ ...result, status: 1 })
}

function errorResponseToClient (res, error) {
  console.warn(error)
  if (error instanceof ServiceError || error instanceof ValidationError) {
    res
      .status(400)
      .send({
        status: 0,
        error: { fields: error.fields, code: error.code }
      })
  } else {
    res
      .status(500)
      .send({
        status: 0,
        error: { message: 'Unknown server error', code: 'UNKNOWN_ERROR' }
      })
  }
}

module.exports = { makeServiceRunner }
