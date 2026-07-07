# svelte-rune-form

Lightweight, type-safe form library for Svelte 5 built with runes.

## Features

- Built with Svelte 5 runes
- Validates on blur or change — your choice
- Works with any [Standard Schema](https://standardschema.dev) compliant library — Zod, Valibot, ArkType, and more
- Also works with any custom validator via a simple validator interface
- Async `onSubmit` with `isPending` state
- Bulk updates via `setValues`
- Server-side error support via `setErrors`
- TypeScript ready

## Installation

```bash
npm install svelte-rune-form
```

Bring your own schema library — any [Standard Schema](https://standardschema.dev) compliant package works, for example:

```bash
npm install valibot
# or
npm install zod
```

## Usage

```svelte
<script lang="ts">
    import * as v from 'valibot'
    import { createForm } from 'svelte-rune-form'

    const schema = v.object({
        email: v.pipe(v.string(), v.nonEmpty('Email is required'), v.email('Invalid email')),
        password: v.pipe(v.string(), v.nonEmpty('Password is required'), v.minLength(8, 'At least 8 characters'))
    })

    const { form, errors, handleValidate, handleSubmit, isValid, isPending } = createForm({
        initialValues: { email: '', password: '' },
        validator: schema,
        onSubmit: async (values) => {
            await api.login(values)
        }
    })
</script>

<form onsubmit={handleSubmit}>
    <input
        bind:value={form.email}
        onblur={() => handleValidate('email')}
    />
    {#if errors.email}
        <span>{errors.email}</span>
    {/if}

    <input
        type="password"
        bind:value={form.password}
        onblur={() => handleValidate('password')}
    />
    {#if errors.password}
        <span>{errors.password}</span>
    {/if}

    <button type="submit" disabled={!isValid()}>
        {isPending() ? 'Submitting...' : 'Submit'}
    </button>
</form>
```

Schema is passed directly — no adapter or wrapper needed. This works the same way with Zod, ArkType, or any other Standard Schema compliant library:

```ts
import * as z from 'zod'

const schema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email')
})

createForm({
    initialValues: { email: '' },
    validator: schema,
    onSubmit: async (values) => { ... }
})
```

## Validate on change

Attach `handleValidate` to `onchange` instead of `onblur`:

```svelte
<input
    bind:value={form.email}
    onchange={() => handleValidate('email')}
/>
```

## Bulk updates

Use `setValues` to update multiple fields at once from outside the form (e.g. prefilling with data from an API):

```svelte
<script lang="ts">
	const { form, errors, handleValidate, handleSubmit, setValues } = createForm({
		initialValues: { email: '', password: '' },
		validator: schema,
		onSubmit: async (values) => {
			await api.register(values)
		}
	})

	onMount(async () => {
		const profile = await api.getProfile()
		setValues({ email: profile.email })
	})
</script>
```

## Server-side errors

Use `setErrors` to display errors returned from your API:

```svelte
<script lang="ts">
    const { form, errors, handleValidate, handleSubmit, setErrors } = createForm({
        initialValues: { email: '' },
        validator: schema,
        onSubmit: async (values) => {
            const res = await api.register(values)
            if (res.error) {
                setErrors({ email: 'Email already exists' })
            }
        }
    })
</script>
```

## Custom validator

If you don't want to use a schema library, provide your own validator function:

```ts
import { createForm } from 'svelte-rune-form'

const { form, errors, handleValidate, handleSubmit } = createForm({
    initialValues: { email: '' },
    validator: (values) => {
        const issues: Record<string, string> = {}
        if (!values.email) {
            issues.email = 'Required'
        }
        if (!values.email.includes('@')) {
            issues.email = 'Invalid email'
        }
        return issues
    },
    onSubmit: async (values) => {
        console.log(values)
    }
})
```

## Reset

```svelte
<script lang="ts">
    const { form, errors, handleValidate, handleSubmit, reset } = createForm({
        initialValues: { email: '', password: '' },
        validator: schema,
        onSubmit: async (values) => {
            await api.login(values)
            reset()
        }
    })
</script>

<button type="button" onclick={reset}>Reset</button>
```

## Dirty state

```svelte
<script lang="ts">
    const { form, handleValidate, handleSubmit, isDirty } = createForm({ ... })
</script>

{#if isDirty()}
    <span>You have unsaved changes</span>
{/if}
```

## API

### `createForm(options)`

#### Options

| Option | Type | Description |
|---|---|---|
| `initialValues` | `T` | Initial form values |
| `validator` | `Validator<T> \| StandardSchemaV1<T>` | A [Standard Schema](https://standardschema.dev) compliant schema (Zod, Valibot, ArkType, etc.) or a custom validator function |
| `onSubmit` | `(values: T) => Promise<void> \| void` | Called with validated values on submit |

#### Returns

| Property | Type | Description |
|---|---|---|
| `form` | `T` | Reactive form values — use with `bind:value` |
| `errors` | `Partial<Record<keyof T, string>>` | Reactive field errors |
| `handleValidate` | `(field: keyof T) => void` | Attach to `onblur` or `onchange` |
| `handleSubmit` | `(e: SubmitEvent) => Promise<void>` | Attach to form `onsubmit` |
| `isValid()` | `() => boolean` | Returns true when all validated fields pass |
| `isDirty()` | `() => boolean` | Returns true when form differs from initial values |
| `isPending()` | `() => boolean` | Returns true during async submit |
| `setValues(newValues)` | `(newValues: Partial<T>) => void` | Set form values from a partial object |
| `setErrors(errors)` | `(errors: Partial<Record<keyof T, string>>) => void` | Set server-side errors |
| `reset()` | `() => void` | Reset form to initial values |

## Important note on reactivity

`form` and `errors` are reactive objects. You can destructure them, but **do not destructure their properties** — access them directly:

```svelte
<script>
    // ✓ correct — destructure the returned object
    const { form, errors } = createForm(...)

    // ✓ correct — access properties directly
    form.email
    errors.email
</script>

<!-- ✓ correct -->
<input bind:value={form.email} />

<!-- ✗ loses reactivity — don't do this -->
<script>
    const { form } = createForm(...)
    const { email } = form // loses reactivity
</script>
```

Functions like `isValid()`, `isDirty()`, and `isPending()` are intentionally functions rather than plain values — this ensures they always return the current state when called in your template.

## License

MIT
