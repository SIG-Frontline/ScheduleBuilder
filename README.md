# SIG Frontline - Frontend

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

**Before anything, make sure you have the environment variables set up, you can find the `.env.example` file in the root of the project, you can copy it and rename it to `.env.local` and fill in the values.**

Then you can run the following commands:

```bash
pnpm install # this will install all dependencies, make sure you have pnpm installed - https://pnpm.io/installation
pnpm dev # this will start the development server, it will print the url in the console
```

## Folder Structure

`/src` - Contains all the source code for the project
`/src/lib` - Contains all the utility functions and TS files
`src/components` - Contains all the components for the project
`src/routes` - Contains all the routes for the project

- `src/routes/api` - Contains all the api routes

`src/themes` - Contains all the custom theme files for the project  
`/static` - Contains all the static files for the project, whrn accessing the URL for these don't inclide the /static in the path
