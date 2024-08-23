import { z } from 'zod'
import { OrderLineArgs, BatchArgs } from '#app/types.mjs'
import { ValidationError } from '#app/errors.mjs'

class Validator {
  schema: z.ZodObject<any, any>

  constructor({ schema }: { schema: z.ZodObject<any, any> }) {
    this.schema = schema
  }

  validate(data: any) {
    const validationResult = this.schema.safeParse(data)
    if (!validationResult.success) {
      throw new ValidationError(`Invalid input: ${validationResult.error}`)
    }

    return validationResult.data
  }
}

class OrderLineValidator extends Validator {
  constructor() {
    super({
      schema: z.object({
        orderref: z.string(),
        sku: z.string(),
        qty: z.number(),
      })
    })
  }

  declare validate: (data: any) => OrderLineArgs
}

class BatchValidator extends Validator {
  constructor() {
    super({
      schema: z.object({
        ref: z.string(),
        sku: z.string(),
        qty: z.number(),
        eta: z.string().date().nullable().default(null),
      })
    })
  }

  declare validate: (data: any) => BatchArgs
}

export { OrderLineValidator, BatchValidator, Validator }
