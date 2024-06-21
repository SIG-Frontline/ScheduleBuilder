# SIG Frontline - Frontend

[Website](sigfrontline.com/)

## Tools

- [svelte](https://svelte.dev/)
- [sveltekit](https://kit.svelte.dev/)
- [tailwindcss](https://tailwindcss.com/)
- [skeleton](https://www.skeleton.dev/)
- [pnpm](https://pnpm.io/)
- [vite](https://vitejs.dev/)
- [prettier](https://prettier.io/)
- [eslint](https://eslint.org/)
- [typescript](https://www.typescriptlang.org/)

## Getting Started

1. Before anything, make sure you have the environment variables set up, you can find the `.env.example` file in the root of the project, you can copy it and rename it to `.env.local` and fill in the values.
2. Make sure you have the latest version of [node](https://nodejs.org/en) AND [pnpm](https://pnpm.io/installation) installed.
3. To install the dependencies, run the following commands:

```bash
pnpm install
```

4. To start the development server, run the following command:

```bash
pnpm dev
```

5. To build the project, run the following command:

```bash
pnpm build
```

6. To preview the built project, run the following command:

```bash
pnpm preview
```

## TailwindCSS & Skeleton UI

The project uses TailwindCSS for styling. You can find the TailwindCSS documentation [here](https://tailwindcss.com/docs).  
We also use Skeleton UI for some components. You can find the Skeleton UI documentation [here](https://www.skeleton.dev/).

A few things to note:

- For a color to change with the theme, see [Design Tokens](https://www.skeleton.dev/docs/tokens)
- To make a new theme, see [the addatheme.md file](/src/themes/addatheme.md)

## Icons

The icons used in the project are from [material icons](https://fonts.google.com/icons)

You can select an icon on [this site](https://fonts.google.com/icons) and paste the icon code under the "Inserting the icon" section, and it will render the icon on the page.
The code will look like this:

```html
<span class="material-symbols-outlined"> menu </span>
```

This will just work since the font is imported in the project in the layout file.

"menu" is the icon name - but will be replaced with the icon when rendered.

To change the icon color, or size, you can add Tailwind classes to the span tag  
(remember that the icon is rendered as text, so to make the color work, you need to add the text- prefix to the color class):

```html
<span class="material-symbols-outlined text-2xl text-red-500"> menu </span>
```

The above code will render the icon in red and with a font size of 2xl.
