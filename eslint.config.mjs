// packages/web/eslint.config.mjs
import antfu from '@antfu/eslint-config'

// on importe la config Nuxt auto-générée
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    type: 'app',
    vue: true,
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: false,
      quotes: 'single',
    },
    ignore: [
      '.pnpm-store/',
      'libs/migrations/*',
      'libs/migrations/meta/*.json',
    ],
  }, {
    rules: {
      'ts/consistent-type-definitions': ['error', 'type'],
      'no-console': ['warn'],
      'antfu/no-top-level-await': ['off'],
      'node/prefer-global/process': ['off'],
      'node/no-process-env': ['error'],
      'perfectionist/sort-imports': ['error', {
        order: 'asc',
        type: 'natural',
        groups: [
          ['builtin', 'external'],
          ['internal'],
          ['parent', 'sibling', 'index'],
        ],
      }],
      'unicorn/filename-case': ['error', {
        case: 'kebabCase',
        ignore: ['README.md'],
      }],
    },
  }),
)
