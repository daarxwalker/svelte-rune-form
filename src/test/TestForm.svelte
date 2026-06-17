<script lang="ts">
	import * as v from 'valibot'
	import { createForm } from '$lib/create-form.svelte'

	const schema = v.object({
		email: v.pipe(v.string(), v.nonEmpty('Email is required'), v.email('Invalid email')),
		password: v.pipe(
			v.string(),
			v.nonEmpty('Password is required'),
			v.minLength(8, 'At least 8 characters')
		)
	})

	let submitted = $state<null | { email: string; password: string }>(null)

	const f = createForm({
		initialValues: { email: '', password: '' },
		onSubmit: async (values) => {
			submitted = values
		},
		validator: schema
	})
</script>

<form onsubmit={f.handleSubmit}>
	<input bind:value={f.form.email} onblur={() => f.handleValidate('email')} data-testid="email" />
	{#if f.errors.email}
		<span data-testid="email-error">{f.errors.email}</span>
	{/if}

	<input
		bind:value={f.form.password}
		onblur={() => f.handleValidate('password')}
		data-testid="password"
		type="password"
	/>
	{#if f.errors.password}
		<span data-testid="password-error">{f.errors.password}</span>
	{/if}

	<button data-testid="submit" type="submit">Submit</button>
	<button onclick={f.reset} data-testid="reset" type="button">Reset</button>
	<button
		onclick={() => f.setErrors({ email: 'Email already exists' })}
		data-testid="set-server-error"
		type="button"
	>
		Simulate server error
	</button>

	{#if f.isDirty()}
		<span data-testid="dirty">dirty</span>
	{/if}

	{#if f.isPending()}
		<span data-testid="pending">pending</span>
	{/if}

	{#if f.isValid()}
		<span data-testid="valid">valid</span>
	{/if}

	{#if submitted}
		<div data-testid="submitted">{JSON.stringify(submitted)}</div>
	{/if}
</form>
