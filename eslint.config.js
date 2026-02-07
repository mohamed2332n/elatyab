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
      // Custom rule to prevent non-VITE_ prefixed environment variables in client-side code
      'no-restricted-properties': [
        'error',
        {
          object: 'import.meta',
          property: 'env',
          message: 'Direct access to import.meta.env is restricted. Use utility functions from "@/lib/env" instead to ensure proper VITE_ prefix validation.'
        },
        {
          object: 'process',
          property: 'env',
          message: 'Client-side access to process.env is not allowed. Use import.meta.env with VITE_ prefix instead.'
        }
      ],
      // Rule to prevent non-VITE_ prefixed environment variables
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[object.property.name="env"][object.object.name="meta"][property.name=/^(?!VITE_)/]',
          message: 'Only VITE_ prefixed environment variables are allowed in client-side code to prevent accidental exposure of sensitive credentials.'
        }
      ]
    },
  }
);