import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { isStandard, standard } from '$lib/validator'
import { valibot } from '$lib/validator'

describe('standard', () => {
	const schema = v.object({
		email: v.pipe(v.string(), v.nonEmpty('Email is required'), v.email('Invalid email')),
		password: v.pipe(v.string(), v.minLength(8, 'At least 8 characters'))
	})

	it('returns no issues for valid data', () => {
		const validate = standard(schema)
		const issues = validate({ email: 'test@test.com', password: 'password123' })
		expect(issues).toEqual({})
	})

	it('returns issues for invalid data', async () => {
		const validate = standard(schema)
		const issues = await validate({ email: '', password: 'short' })
		expect(issues.email).toBe('Email is required')
		expect(issues.password).toBe('At least 8 characters')
	})

	it('returns only the first issue per field', () => {
		const validate = standard(schema)
		const issues = validate({ email: 'not-an-email', password: 'short' })
		expect(Object.keys(issues)).toEqual(['email', 'password'])
	})

	it('throws on async validation', () => {
		const asyncSchema = {
			'~standard': {
				validate: () => Promise.resolve({ issues: undefined }),
				vendor: 'test',
				version: 1
			}
		}
		// @ts-expect-error expect async schema
		const validate = standard(asyncSchema as unknown)
		// @ts-expect-error expect async schema
		expect(() => validate({} as unknown)).toThrow('Async schema validation is not supported')
	})
})

describe('isStandard', () => {
	it('returns true for a Standard Schema compliant object', () => {
		const schema = v.object({ email: v.string() })
		expect(isStandard(schema)).toBe(true)
	})

	it('returns false for a plain validator function', () => {
		const validatorFn = () => ({})
		expect(isStandard(validatorFn)).toBe(false)
	})

	it('returns false for null and primitives', () => {
		expect(isStandard(null)).toBe(false)
		expect(isStandard('string')).toBe(false)
		expect(isStandard(42)).toBe(false)
	})
})

describe('valibot helper (backwards compatibility)', () => {
	const schema = v.object({
		email: v.pipe(v.string(), v.nonEmpty('Email is required'), v.email('Invalid email'))
	})

	it('produces the same result as standard', () => {
		const viaHelper = valibot(schema)
		const viaDirect = standard(schema)

		const result1 = viaHelper({ email: '' })
		const result2 = viaDirect({ email: '' })

		expect(result1).toEqual(result2)
	})
})
