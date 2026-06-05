# svelte-rune-form

Lightweight, type-safe form library for Svelte 5 built with runes.

## Features

- Built with Svelte 5 runes
- Validates on blur or change — your choice
- Works with any validation library via a simple validator interface
- First-class [Valibot](https://valibot.dev) support out of the box
- Async `onSubmit` with `isPending` state
- Server-side error support via `setErrors`
- TypeScript ready

## Installation

```bash
npm install svelte-rune-form
```

Valibot is optional but recommended:

```bash
npm install valibot
```

## Usage

```svelte
<script lang="ts">
    import * as v from 'valibot'
    import { createForm, valibot } from 'svelte-rune-form'

    const schema = v.object({
        email: v.pipe(v.string(), v.nonEmpty('Email is required'), v.email('Invalid email')),
        password: v.pipe(v.string(), v.nonEmpty('Password is required'), v.minLength(8, 'At least 8 characters'))
    })

    const { form, errors, handleValidate, handleSubmit, isValid, isPending } = createForm({
        initialValues: { email: '', password: '' },
        validator: valibot(schema),
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

## Validate on change

Attach `handleValidate` to `onchange` instead of `onblur`:

```svelte
<input
    bind:value={form.email}
    onchange={() => handleValidate('email')}
/>
```

## Server-side errors

Use `setErrors` to display errors returned from your API:

```svelte
<script lang="ts">
    const { form, errors, handleValidate, handleSubmit, setErrors } = createForm({
        initialValues: { email: '' },
        validator: valibot(schema),
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

You can use any validation library by providing your own validator function:

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
        validator: valibot(schema),
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
| `validator` | `Validator<T>` | Validator function — use `valibot()` helper or provide your own |
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
| `setErrors(errors)` | `(errors: Partial<Record<keyof T, string>>) => void` | Set server-side errors |
| `reset()` | `() => void` | Reset form to initial values |

### `valibot(schema)`

Helper that wraps a Valibot schema into a `Validator` function:

```ts
import * as v from 'valibot'
import { valibot } from 'svelte-rune-form'

const validator = valibot(v.object({
    email: v.pipe(v.string(), v.email('Invalid email'))
}))
```

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
