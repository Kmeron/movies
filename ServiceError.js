class ServiceError extends Error {
  constructor ({ message, fields, code }) {
    super(message)
    this.code = code
    this.fields = fields
  }
}
module.exports = ServiceError
