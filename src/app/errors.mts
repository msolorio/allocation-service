class BadRequestError extends Error { }

class InvalidSku extends BadRequestError { }
class OutOfStock extends BadRequestError { }

export {
  BadRequestError,
  InvalidSku,
  OutOfStock,
}

