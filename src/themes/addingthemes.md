# How to add a Custom Theme

1. Add a new `nameoftheme.ts` file to the `src/themes` folder
2. Go to the Theme Generator [here](https://www.skeleton.dev/docs/generator)
3. Copy the generated code and paste it into the .ts file
4. ==Update the `myCustomTheme` const, and the `name` property to the name of your theme to avoid conflicts==

```ts
export const myCustomTheme: CustomThemeConfig = { // Update this from myCustomTheme to something else
    name: 'my-custom-theme', // Update this from my-custom-theme to something else
```

5. go to `src/lib/constants.ts` and add the theme to the `THEMES` array

- The `id` should be the name of the theme
- The `label` should be the name of the theme that you put in the `name` property in the `nameoftheme.ts` file

6. in `tailwind.config.js` import the new theme config you just added
7. Then update the in the `plugins.skeleton.themes.custom` array to include the new theme config

```js
//...
import { myCustomTheme } from './src/themes/test';
//...
const config = {
//...
    plugins: [
        forms,
        skeleton({
            themes: {
                preset: [
                    'modern',
                    //...
                    'wintry'
                ],
                custom: [myCustomTheme]
            }
        })
    ]
} satisfies Config;
export default config;
```

### To update the default theme

1. update the below line in `src/lib/themeStateStore.ts` to have the name of the theme you want to be the default

```js
const defaultData = '[default theme name]'; // default theme
```

2. in `src/app.html` update the below line to have the name of the theme you want to be the default

```html
<body data-sveltekit-preload-data="hover" data-theme="[default theme name]"></body>
```
