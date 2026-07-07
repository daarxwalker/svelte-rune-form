import type { StandardSchemaV1 } from '@standard-schema/spec'
import { isStandard, standard, type ValidationIssues, type Validator } from './validator'

type CreateFormOptions<T extends Record<string, unknown>> = {
	initialValues: T
	validator: StandardSchemaV1<NoInfer<T>> | Validator<NoInfer<T>>
	onSubmit: (values: T) => Promise<void> | void
}

export function createForm<T extends Record<string, unknown>>({
	initialValues,
	onSubmit,
	validator
}: CreateFormOptions<T>) {
	const validate = isStandard<T>(validator) ? standard(validator) : validator
	const form = $state<T>({ ...initialValues })
	let errors = $state<Partial<Record<keyof T, string>>>({})
	let validated = $state<Partial<Record<keyof T, boolean>>>({})
	let pending = $state(false)

	$effect(() => {
		const snapshot = { ...form }
		const issues = validate(snapshot)

		for (const key of Object.keys(snapshot)) {
			const field = key as keyof T
			if (!validated[field]) {
				continue
			}
			errors[field] = (issues as ValidationIssues<T>)[field] ?? ''
		}
	})

	function handleValidate(field: keyof T) {
		validated[field] = true
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault()

		for (const key of Object.keys(form)) {
			validated[key as keyof T] = true
		}

		const issues = validate({ ...form })
		const issueKeys = Object.keys(issues)

		if (issueKeys.length > 0) {
			for (const key of issueKeys) {
				const field = key as keyof T
				errors[field] = (issues as ValidationIssues<T>)[field] ?? ''
			}
			return
		}

		pending = true
		try {
			await onSubmit({ ...form })
		} finally {
			pending = false
		}
	}

	function reset() {
		for (const key of Object.keys(initialValues)) {
			form[key as keyof T] = initialValues[key as keyof T]
		}
		errors = {}
		validated = {}
	}

	function setValues(newValues: Partial<T>) {
		for (const key of Object.keys(newValues)) {
			const field = key as keyof T
			if (!(field in form)) {
				continue
			}
			form[field] = newValues[field] as T[typeof field]
		}
	}

	function setErrors(newErrors: Partial<Record<keyof T, string>>) {
		for (const key of Object.keys(newErrors)) {
			const field = key as keyof T
			errors[field] = newErrors[field]
			validated[field] = true
		}
	}

	return {
		get errors() {
			return errors
		},
		get form() {
			return form
		},
		handleSubmit,
		handleValidate,
		isDirty: () =>
			Object.keys(form).some((k) => form[k as keyof T] !== initialValues[k as keyof T]),
		isPending: () => pending,
		isValid: () => Object.keys(validated).length > 0 && Object.values(errors).every((e) => !e),
		reset,
		setErrors,
		setValues
	}
}
