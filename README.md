# Task Tracker

A simple task list app built with React. Add tasks with priority, category, due date, optional description, and sub-tasks (with their own due dates). Tasks are sorted by the soonest sub-task or task due date. Data is saved in your browser (localStorage) so it survives refresh and redeploys.

**Tech:** [Create React App](https://github.com/facebook/create-react-app), React 19.  
**Hosting:** GitHub ([Adamtad/task-tracker](https://github.com/Adamtad/task-tracker)) with automatic deploys to [Vercel](https://vercel.com).

---

## Setup

- **Node.js** (v18 or newer) and **npm** — [nodejs.org](https://nodejs.org)
- (Optional) **Git** and a **GitHub** account if you want to push changes

---

## Run locally

1. **Clone the repo** (or open the project folder if you already have it):
   ```bash
   git clone https://github.com/Adamtad/task-tracker.git
   cd task-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the dev server:**
   ```bash
   npm start
   ```
   The app opens at [http://localhost:3000](http://localhost:3000). Edit the code and the page will reload automatically.

---

## Push your changes

When you’ve made changes and want to update the live site:

1. **Stage and commit:**
   ```bash
   git add -A
   git commit -m "Short description of what you changed"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin master
   ```
   Vercel is connected to this repo, so each push to `master` triggers a new deployment. The live site usually updates within a minute or two.

**Optional — deploy without pushing:** To deploy from your machine without using Git:
   ```bash
   npx vercel --prod
   ```
   You need to be logged in to Vercel (`npx vercel login` if not).

---

## Available scripts

| Command | Description |
|--------|-------------|
| `npm start` | Run the app locally at [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Production build into the `build` folder |
| `npm test` | Run the test runner |

---

## Learn more

- [Create React App docs](https://facebook.github.io/create-react-app/docs/getting-started)
- [React docs](https://reactjs.org/)
