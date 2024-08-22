import { OrderLineValidator, BatchValidator } from '#app/entrypoints/validators.mjs'
import { ValidationError } from '#app/errors.mjs'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const later = new Date(today)
later.setDate(today.getDate() + 30)

describe('OrderlineValidator', () => {
  it('Validates successfully for valid objects', () => {
    const orderlineValidator = new OrderLineValidator()
    const result = orderlineValidator.validate({ orderref: 'order-1', sku: 'TABLE', qty: 5 })

    expect(result).toEqual({
      orderref: 'order-1',
      sku: 'TABLE',
      qty: 5,
    })
  })

  it('Should throw an error for invalid input', () => {
    const orderlineValidator = new OrderLineValidator()
    const orderlineInput = { orderref: 'order-1', sku: 'TABLE' }
    expect(() => orderlineValidator.validate(orderlineInput)).toThrow(ValidationError)
    expect(() => orderlineValidator.validate(orderlineInput)).toThrow(/Invalid input/)
    expect(() => orderlineValidator.validate(orderlineInput)).toThrow(/qty/)
  })
})

describe('BatchValidator', () => {
  it('Validates successfully for valid objects', () => {
    const batchValidator = new BatchValidator()
    const result = batchValidator.validate({ ref: 'batch-1', sku: 'TABLE', qty: 5 })

    expect(result).toEqual({
      ref: 'batch-1',
      sku: 'TABLE',
      qty: 5,
      eta: null,
    })
  })

  it('Should throw an error for invalid input', () => {
    const batchValidator = new BatchValidator()
    const batchInput = { ref: 'batch-1', qty: 5 }
    expect(() => batchValidator.validate(batchInput)).toThrow(ValidationError)
    expect(() => batchValidator.validate(batchInput)).toThrow(/Invalid input/)
    expect(() => batchValidator.validate(batchInput)).toThrow(/sku/)
  })
})