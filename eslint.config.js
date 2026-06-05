import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import perfectionist from 'eslint-plugin-perfectionist'
import svelte from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import path from 'node:path'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.js'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				projectService: true,
				svelteConfig
			}
		},
		rules: {
			'svelte/sort-attributes': [
				'warn',
				{
					order: [
						'this',
						'bind:this',
						'id',
						'name',
						'slot',
						// bind:* direktives
						{ match: '/^bind:/u', sort: 'alphabetical' },
						// {@attach ...} — Svelte 5.29+:
						// if sort-attributes ignores (they are template tags, not attributes),
						{ match: '/^@attach/u', sort: 'alphabetical' },
						// use:* directives are still sorted alphabetically
						{ match: '/^use:/u', sort: 'alphabetical' },
						// transition/animation direktives
						{ match: '/^(transition|in|out|animate):/u', sort: 'alphabetical' },
						// event handlers (Svelte 5 syntax: onclick, oninput, ...)
						{ match: '/^on[a-z]/u', sort: 'alphabetical' },
						// common attributes and props alphabetically
						{
							match: [
								'!/:/u', // without colon (excluded bind:, use:, transition:, atd.)
								'!/^@/u', // without @ (excluded @attach)
								'!/^(?:class|style)$/u', // without class or style
								'!/^on[a-z]/u' // without event handler
							],
							sort: 'alphabetical'
						},
						// class:
						['class', '/^class:/u'],
						// style:
						['style', '/^style:/u'],
						{ match: '/^\\.\\.\\./', sort: 'alphabetical' }
					]
				}
			]
		}
	},
	{
		plugins: { perfectionist },
		rules: {
			'perfectionist/sort-enums': ['error', { order: 'asc', type: 'natural' }],
			'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
			'perfectionist/sort-imports': [
				'error',
				{
					customGroups: [
						{
							elementNamePattern: '^svelte($|/)',
							groupName: 'svelte-type',
							selector: 'type'
						},
						{
							elementNamePattern: '^svelte($|/)|^\\$app/|^\\$env/',
							groupName: 'svelte'
						},
						{
							elementNamePattern: '^svelte-|^@lucide/svelte',
							groupName: 'svelte-ecosystem'
						},
						{
							elementNamePattern: '\\.svelte$|^\\$lib/.*\\.svelte$',
							groupName: 'svelte-local'
						}
					],
					groups: [
						'svelte-type',
						'svelte',
						'svelte-ecosystem',
						['value-builtin', 'value-external'],
						'type-import',
						'type-internal',
						'value-internal',
						['type-parent', 'type-sibling', 'type-index'],
						['value-parent', 'value-sibling', 'value-index'],
						'svelte-local',
						'side-effect',
						'style',
						'ts-equals-import',
						'unknown'
					],
					internalPattern: ['^\\$lib/.*'],
					newlinesBetween: 0,
					order: 'asc',
					type: 'natural'
				}
			],
			'perfectionist/sort-intersection-types': ['error', { order: 'asc', type: 'natural' }],
			'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
			'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
			'perfectionist/sort-object-types': [
				'error',
				{
					groups: ['required-property', 'optional-property'],
					order: 'asc',
					partitionByComment: true,
					partitionByNewLine: true,
					type: 'natural'
				}
			],
			'perfectionist/sort-objects': [
				'error',
				{
					order: 'asc',
					partitionByComment: true,
					partitionByNewLine: true,
					type: 'natural'
				}
			],
			'perfectionist/sort-union-types': [
				'error',
				{
					groups: ['named', 'keyword', 'literal', 'nullish'],
					order: 'asc',
					type: 'natural'
				}
			],

			// Classes
			'perfectionist/sort-array-includes': ['error', { order: 'asc', type: 'natural' }],
			'perfectionist/sort-classes': [
				'error',
				{
					groups: [
						'index-signature',
						'static-property',
						'private-property',
						'property',
						'constructor',
						'static-method',
						'private-method',
						'method',
						'unknown'
					],
					order: 'asc',
					partitionByComment: true,
					type: 'natural'
				}
			]
		}
	},
	{
		// Override or add rule settings here, such as:
		// 'svelte/button-has-type': 'error'
		rules: {}
	}
)
