# Import & use this project in Cursor

## Option 1: Open the existing project (already on your machine)

1. In **Cursor**, go to **File → Open Folder** (or `Ctrl+K Ctrl+O`).
2. Choose this folder:
   ```
   C:\Users\MAXWELL0\dyad-apps\bubbling-capybara-burst
   ```
3. Click **Select Folder**. Cursor will load the project and use the `.cursor/rules` for this repo.

## Option 2: Clone from GitHub into a new folder

1. In **Cursor**, open the terminal (`Ctrl+`` ` or **Terminal → New Terminal**).
2. Go to where you want the project (e.g. Desktop or a dev folder):
   ```powershell
   cd C:\Users\MAXWELL0\Desktop
   ```
3. Clone the repo:
   ```powershell
   git clone https://github.com/mohamed2332n/elatyab.git
   ```
4. **File → Open Folder** and select the new `elatyab` folder.
5. Install dependencies and run:
   ```powershell
   pnpm install
   pnpm dev
   ```

## After opening in Cursor

- **Rules**: The project has `.cursor/rules` so Cursor’s AI uses the right stack and conventions.
- **Env**: If you use Supabase or env vars, add a `.env` (see `src/docs/environment-variables.md`). Don’t commit secrets.
- **Commands**:
  - `pnpm dev` – start dev server
  - `pnpm build` – production build
  - `pnpm lint` – run ESLint

Your GitHub repo: [https://github.com/mohamed2332n/elatyab](https://github.com/mohamed2332n/elatyab)
