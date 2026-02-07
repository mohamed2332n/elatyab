import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Custom rule to prevent exposure of non-VITE_ prefixed environment variables
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.property.name='env'][property.name=/^(?!VITE_).*$/]",
          message: 'Only VITE_ prefixed environment variables are allowed in client-side code. Use VITE_ prefix for client-side environment variables.',
        }
      ]
    },
  },
);