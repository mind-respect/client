let requestErrors = []
export default {
  addRequestError: function (requestError) {
    requestErrors.push(
      requestError
    )
  },
  requestErrors: requestErrors
}
