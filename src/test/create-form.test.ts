import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { page } from 'vitest/browser'
import TestForm from './TestForm.svelte'

describe('createForm', () => {
	describe('init', () => {
		it('does not show errors on init', async () => {
			render(TestForm)
			await expect.element(page.getByTestId('email-error')).not.toBeInTheDocument()
			await expect.element(page.getByTestId('password-error')).not.toBeInTheDocument()
		})

		it('has empty initial values', async () => {
			render(TestForm)
			await expect.element(page.getByTestId('email')).toHaveValue('')
			await expect.element(page.getByTestId('password')).toHaveValue('')
		})

		it('is not dirty on init', async () => {
			render(TestForm)
			await expect.element(page.getByTestId('dirty')).not.toBeInTheDocument()
		})

		it('is not valid on init', async () => {
			render(TestForm)
			await expect.element(page.getByTestId('valid')).not.toBeInTheDocument()
		})
	})

	describe('blur validation', () => {
		it('shows error after blur on empty email', async () => {
			render(TestForm)
			await page.getByTestId('email').click()
			await page.getByTestId('password').click()
			await expect.element(page.getByTestId('email-error')).toBeInTheDocument()
			await expect
				.element(page.getByTestId('email-error'))
				.toHaveTextContent('Email is required')
		})

		it('shows error for invalid email format', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('not-an-email')
			await page.getByTestId('password').click()
			await expect.element(page.getByTestId('email-error')).toHaveTextContent('Invalid email')
		})

		it('shows error for short password', async () => {
			render(TestForm)
			await page.getByTestId('password').fill('short')
			await page.getByTestId('email').click()
			await expect
				.element(page.getByTestId('password-error'))
				.toHaveTextContent('At least 8 characters')
		})

		it('clears error after fixing invalid value', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('not-an-email')
			await page.getByTestId('password').click()
			await expect.element(page.getByTestId('email-error')).toBeInTheDocument()
			await page.getByTestId('email').fill('valid@email.com')
			await page.getByTestId('password').click()
			await expect.element(page.getByTestId('email-error')).not.toBeInTheDocument()
		})
	})

	describe('dirty', () => {
		it('is dirty after changing a field', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('a')
			await expect.element(page.getByTestId('dirty')).toBeInTheDocument()
		})

		it('is not dirty after reset', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('test@test.com')
			await page.getByTestId('reset').click()
			await expect.element(page.getByTestId('dirty')).not.toBeInTheDocument()
		})
	})

	describe('submit', () => {
		it('shows all errors on empty submit', async () => {
			render(TestForm)
			await page.getByTestId('submit').click()
			await expect.element(page.getByTestId('email-error')).toBeInTheDocument()
			await expect.element(page.getByTestId('password-error')).toBeInTheDocument()
		})

		it('calls onSubmit with valid data', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('test@test.com')
			await page.getByTestId('password').fill('password123')
			await page.getByTestId('submit').click()
			await expect.element(page.getByTestId('submitted')).toBeInTheDocument()
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('test@test.com')
		})

		it('does not call onSubmit with invalid data', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('not-an-email')
			await page.getByTestId('submit').click()
			await expect.element(page.getByTestId('submitted')).not.toBeInTheDocument()
		})
	})

	describe('reset', () => {
		it('clears form and errors after reset', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('test@test.com')
			await page.getByTestId('submit').click()
			await page.getByTestId('reset').click()
			await expect.element(page.getByTestId('email')).toHaveValue('')
			await expect.element(page.getByTestId('password-error')).not.toBeInTheDocument()
		})

		it('is not valid after reset', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('test@test.com')
			await page.getByTestId('password').fill('password123')
			await page.getByTestId('reset').click()
			await expect.element(page.getByTestId('valid')).not.toBeInTheDocument()
		})
	})

	describe('setErrors', () => {
		it('displays server-side errors', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('test@test.com')
			await page.getByTestId('password').fill('password123')
			await page.getByTestId('set-server-error').click()
			await expect
				.element(page.getByTestId('email-error'))
				.toHaveTextContent('Email already exists')
		})
	})

	describe('setValues', () => {
		it('updates form fields without triggering validation by default', async () => {
			render(TestForm)
			await page.getByTestId('set-values').click()
			await expect.element(page.getByTestId('email')).toHaveValue('prefilled@test.com')
			await expect.element(page.getByTestId('email-error')).not.toBeInTheDocument()
		})

		it('marks fields as validated when validate option is true', async () => {
			render(TestForm)
			await page.getByTestId('set-invalid-values').click()
			await expect.element(page.getByTestId('email-error')).toHaveTextContent('Invalid email')
		})

		it('allows setting a field to a falsy value', async () => {
			render(TestForm)
			await page.getByTestId('email').fill('test@test.com')
			await page.getByTestId('set-empty-email').click()
			await expect.element(page.getByTestId('email')).toHaveValue('')
		})
	})
})
