import * as v from 'valibot'

export type ValidationIssues<T> = Partial<Record<keyof T, string>>

export type Validator<T> = (values: T) => Promise<ValidationIssues<T>> | ValidationIssues<T>

export function valibot<T extends Record<string, unknown>>(
	schema: v.BaseSchema<T, T, v.BaseIssue<unknown>>
): Validator<T> {
	return (values) => {
		const result = v.safeParse(schema, values)
		if (result.success) {
			return {}
		}
		const issues: ValidationIssues<T> = {}
		for (const issue of result.issues) {
			const field = issue.path?.[0]?.key as keyof T
			if (field && !issues[field]) {
				issues[field] = issue.message
			}
		}
		return issues
	}
}
