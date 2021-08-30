class ApiError extends Error {
  constructor(statusCode, errorMessage) {
    super(errorMessage)
    this.statusCode = statusCode
  }
}

const createHandler = (handler) => async (req, apiRes) => {
  try {
    const res = await handler(req)
    apiRes.status(200).json(res)
  } catch (err) {
    if (err instanceof ApiError) {
      apiRes.status(err.statusCode).json({ errorMessage: err.message })
    } else {
      console.log('err: ', err)
      apiRes.status(500).json({ message: err.message })
    }
  }
}

module.exports = { ApiError, createHandler }
