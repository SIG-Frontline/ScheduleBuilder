<span style="display: flex; align-items: center; justify-content: flex-start;">
<img src="./public/frontline.png" alt="Sig frontline Logo" width="50" height="50">
<h3>Frontline-Lynk</h3>
</span>

# Schedule Builder

## Overview

Schedule Builder is a web application designed to help users create and manage their course schedules at NJIT. It is based on the [current NJIT schedule builder](https://myhub.njit.edu/scbldr/), but with a more modern and user-friendly interface. Users can create multiple schedules for different scenarios, such as different semesters or different majors. The application also supports dark mode and will soon support exporting schedules and sharing schedules with others.

## Features

- Mobile-friendly modern design
- Multiple plans for different schedules
- Dark mode
- Export schedule
- Share schedule with others
- Add custom events

## Installation

To get started with the project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/SIG-Frontline/ScheduleBuilder-Frontend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ScheduleBuilder-Frontend
   ```
3. Install the dependencies:
   ```bash
   pnpm install # or yarn install or npm install
   ```

## Usage

To run the application dev server locally, use the following command:

```bash
pnpm dev # or yarn dev or npm dev
```

Open your browser and navigate to `http://localhost:3000` to view the application.

## Technologies

- React
- TypeScript
- Next.js
- Tailwind CSS
- FullCalendar
- Mantine UI
- MongoDB
- Zustand
- Material Symbols
- ESLint
- PostCSS
- Auth0

## Links and Resources

- [Figma](https://www.figma.com/file/skTbfNm88k2820SaPJGZz3/Frontline-UI?type=design&node-id=113-966&mode=design)
- [Next.js tutorial site](https://nextjs.org/learn)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [FullCalendar documentation](https://fullcalendar.io/docs)
- [Mantine UI documentation](https://mantine.dev/getting-started)
- [MongoDB documentation](https://docs.mongodb.com/)
- [Zustand documentation](https://zustand.docs.pmnd.rs)
- [MongoDB documentation](https://docs.mongodb.com/)

## File Structure

`/public` - Static files.  
To access a file on `/public/images/image.png`, use the following path: `/images/image.png`.

`/src/app` - Next.js app router - used for file system based routing.

`/src/app/api` - api routes for Next.js

`/src/lib/[client|server]` - Reusable functions.  
client code goes in client folder. Server code goes in server folder.

`/src/components` - Reusable components to be used across the application.

`/tests` - Unit tests for the application (playwright)

`.env.example` - Example environment variables file. Rename to `.env.local` and fill in the required values. Please do not commit this file with the environment variables filled in. Please do not delete this file.
