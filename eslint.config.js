import js from '@eslint/js';
import security from 'eslint-plugin-security';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist/**', 'docs/**', 'node_modules/**'] },
  js.configs.recommended,
  security.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-undef': 'off',
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      ecmaVersion: 2022,
      globals: {
        React: true,
      },
      sourceType: 'module',
    },
    settings: {
      react: {
        version: '18.3',
      },
    },
  },
];
