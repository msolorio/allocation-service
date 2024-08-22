class BadRequestError extends Error { }

class InvalidSku extends BadRequestError { }
class OutOfStock extends BadRequestError { }
class ValidationError extends BadRequestError { }

export {
  BadRequestError,
  InvalidSku,
  OutOfStock,
  ValidationError,
}

