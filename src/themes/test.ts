import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const TestTheme: CustomThemeConfig = {
	name: 'test-theme',
	properties: {
		// =~= Theme Properties =~=
		'--theme-font-family-base': `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		'--theme-font-family-heading': `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
		'--theme-font-color-base': '0 0 0',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '24px',
		'--theme-rounded-container': '16px',
		'--theme-border-base': '1px',
		// =~= Theme On-X Colors =~=
		'--on-primary': '0 0 0',
		'--on-secondary': '0 0 0',
		'--on-tertiary': '0 0 0',
		'--on-success': '0 0 0',
		'--on-warning': '0 0 0',
		'--on-error': '255 255 255',
		'--on-surface': '255 255 255',
		// =~= Theme Colors  =~=
		// primary | #94ed6d
		'--color-primary-50': '239 252 233', // #effce9
		'--color-primary-100': '234 251 226', // #eafbe2
		'--color-primary-200': '228 251 219', // #e4fbdb
		'--color-primary-300': '212 248 197', // #d4f8c5
		'--color-primary-400': '180 242 153', // #b4f299
		'--color-primary-500': '148 237 109', // #94ed6d
		'--color-primary-600': '133 213 98', // #85d562
		'--color-primary-700': '111 178 82', // #6fb252
		'--color-primary-800': '89 142 65', // #598e41
		'--color-primary-900': '73 116 53', // #497435
		// secondary | #f2d739
		'--color-secondary-50': '253 249 225', // #fdf9e1
		'--color-secondary-100': '252 247 215', // #fcf7d7
		'--color-secondary-200': '252 245 206', // #fcf5ce
		'--color-secondary-300': '250 239 176', // #faefb0
		'--color-secondary-400': '246 227 116', // #f6e374
		'--color-secondary-500': '242 215 57', // #f2d739
		'--color-secondary-600': '218 194 51', // #dac233
		'--color-secondary-700': '182 161 43', // #b6a12b
		'--color-secondary-800': '145 129 34', // #918122
		'--color-secondary-900': '119 105 28', // #77691c
		// tertiary | #e19f15
		'--color-tertiary-50': '251 241 220', // #fbf1dc
		'--color-tertiary-100': '249 236 208', // #f9ecd0
		'--color-tertiary-200': '248 231 197', // #f8e7c5
		'--color-tertiary-300': '243 217 161', // #f3d9a1
		'--color-tertiary-400': '234 188 91', // #eabc5b
		'--color-tertiary-500': '225 159 21', // #e19f15
		'--color-tertiary-600': '203 143 19', // #cb8f13
		'--color-tertiary-700': '169 119 16', // #a97710
		'--color-tertiary-800': '135 95 13', // #875f0d
		'--color-tertiary-900': '110 78 10', // #6e4e0a
		// success | #83cc15
		'--color-success-50': '236 247 220', // #ecf7dc
		'--color-success-100': '230 245 208', // #e6f5d0
		'--color-success-200': '224 242 197', // #e0f2c5
		'--color-success-300': '205 235 161', // #cdeba1
		'--color-success-400': '168 219 91', // #a8db5b
		'--color-success-500': '131 204 21', // #83cc15
		'--color-success-600': '118 184 19', // #76b813
		'--color-success-700': '98 153 16', // #629910
		'--color-success-800': '79 122 13', // #4f7a0d
		'--color-success-900': '64 100 10', // #40640a
		// warning | #EAB308
		'--color-warning-50': '252 244 218', // #fcf4da
		'--color-warning-100': '251 240 206', // #fbf0ce
		'--color-warning-200': '250 236 193', // #faecc1
		'--color-warning-300': '247 225 156', // #f7e19c
		'--color-warning-400': '240 202 82', // #f0ca52
		'--color-warning-500': '234 179 8', // #EAB308
		'--color-warning-600': '211 161 7', // #d3a107
		'--color-warning-700': '176 134 6', // #b08606
		'--color-warning-800': '140 107 5', // #8c6b05
		'--color-warning-900': '115 88 4', // #735804
		// error | #de1015
		'--color-error-50': '250 219 220', // #fadbdc
		'--color-error-100': '248 207 208', // #f8cfd0
		'--color-error-200': '247 195 197', // #f7c3c5
		'--color-error-300': '242 159 161', // #f29fa1
		'--color-error-400': '232 88 91', // #e8585b
		'--color-error-500': '222 16 21', // #de1015
		'--color-error-600': '200 14 19', // #c80e13
		'--color-error-700': '167 12 16', // #a70c10
		'--color-error-800': '133 10 13', // #850a0d
		'--color-error-900': '109 8 10', // #6d080a
		// surface | #62a336
		'--color-surface-50': '231 241 225', // #e7f1e1
		'--color-surface-100': '224 237 215', // #e0edd7
		'--color-surface-200': '216 232 205', // #d8e8cd
		'--color-surface-300': '192 218 175', // #c0daaf
		'--color-surface-400': '145 191 114', // #91bf72
		'--color-surface-500': '98 163 54', // #62a336
		'--color-surface-600': '88 147 49', // #589331
		'--color-surface-700': '74 122 41', // #4a7a29
		'--color-surface-800': '59 98 32', // #3b6220
		'--color-surface-900': '48 80 26' // #30501a
	}
};
