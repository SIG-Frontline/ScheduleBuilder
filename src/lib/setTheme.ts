/**
 * Set the theme for the application
 * @param selectedThemeVal - The string value of the selected theme
 * @example setTheme('rocket'); //where 'rocket' is a theme defined folowing the `addingthemes.md` guide
 */
export function setTheme(selectedThemeVal: string): void {
	document.body.setAttribute('data-theme', selectedThemeVal);
}
