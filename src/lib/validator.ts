import * as v from 'valibot'
import type { StandardSchemaV1 } from '@standard-schema/spec'

export type ValidationIssues<T> = Partial<Record<keyof T, string>>

export type Validator<T> = (values: T) => Promise<ValidationIssues<T>> | ValidationIssues<T>

export function valibot<T extends Record<string, unknown>>(
	schema: v.BaseSchema<T, T, v.BaseIssue<unknown>>
): Validator<T> {
	return standard(schema as unknown as StandardSchemaV1<T>)
}

export function isStandard<T extends Record<string, unknown>>(
	value: unknown
): value is StandardSchemaV1<T> {
	return typeof value === 'object' && value !== null && '~standard' in value
}

export function standard<T extends Record<string, unknown>>(
	schema: StandardSchemaV1<T>
): Validator<T> {
	return (values) => {
		const result = schema['~standard'].validate(values)
		if (result instanceof Promise) {
			throw new Error('Async schema validation is not supported')
		}
		if (result.issues == null) {
			return {}
		}
		const issues: ValidationIssues<T> = {}
		for (const issue of result.issues) {
			const segment = issue.path?.[0]
			const field = (typeof segment === 'object' ? segment?.key : segment) as
				| undefined
				| keyof T

			if (field && !issues[field]) {
				issues[field] = issue.message
			}
		}
		return issues
	}
}
