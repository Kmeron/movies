const ServiceError = require('../ServiceError')

function makeServiceRunner ({ service }, dumpData) {
  return async (req, res) => {
    const payload = dumpData(req, res)
    console.log(payload)

    try {
      const promise = await service(payload)
      await successResponseToClient(res, promise)
    } catch (error) {
      errorResponseToClient(res, error)
    }
  }
}

async function successResponseToClient (res, promise) {
  const result = await promise
  console.log(result)
  // const data = result?.data ? result : { data: result }
  // console.log(data)
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
