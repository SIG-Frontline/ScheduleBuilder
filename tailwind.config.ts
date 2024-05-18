import { join } from 'path';
import type { Config } from 'tailwindcss';
import { TestTheme } from './src/themes/test';
// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin';
import forms from '@tailwindcss/forms';

const config = {
	// 2. Opt for dark mode to be handled via the class method
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		// 3. Append the path to the Skeleton package
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [
		forms,
		skeleton({
			themes: {
				preset: [
					'modern',
					'skeleton',
					'crimson',
					'gold-nouveau',
					'hamlindigo',
					'rocket',
					'sahara',
					'seafoam',
					'vintage',
					'wintry'
				],
				custom: [TestTheme]
			}
		})
	]
} satisfies Config;

export default config;
