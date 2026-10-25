import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';

export default [
    {
        ignores: ['.next/', 'knex/migrations_stub.js', 'next-env.d.ts'],
    },
    ...tsPlugin.configs['flat/recommended'],
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'],
    // The plugin's recommended preset also enables React Compiler rules, which this project doesn't use.
    {
        plugins: { 'react-hooks': reactHooksPlugin },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    importPlugin.flatConfigs.recommended,
    nextPlugin.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                ...globals.browser,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                typescript: {
                    project: 'tsconfig.json',
                    alwaysTryTypes: true,
                },
            },
        },
    },
    {
        files: ['**/*.js'],
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off',
        },
    },
    // Must be last, so that it can turn off formatting rules from the configs above that conflict with prettier.
    prettierConfig,
];
