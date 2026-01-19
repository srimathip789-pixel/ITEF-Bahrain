# How to Enable Branch Protection

To make the `CODEOWNERS` file and the Code Freeze workflow effective, you **must** enable Branch Protection rules on GitHub.

## Step 1: Go to Repository Settings
1. Open your repository on GitHub: [ITEF-Bahrain](https://github.com/srimathip789-pixel/ITEF-Bahrain)
2. Click on **Settings** (top right tab).
3. On the left sidebar, under "Code and automation", click **Branches**.

## Step 2: Add a Protection Rule
1. Click **Add branch protection rule**.
2. **Branch name pattern**: `main` (or `master`, whichever is your default branch).

## Step 3: Configure Rules
Check the following options:

### A. Enforce CODEOWNERS
1. [x] **Require a pull request before merging**
2. [x] **Require review from Code Owners**
   - *This ensures that any change to `src/` requires YOUR approval specifically.*

### B. Enforce "Prevent Source Changes" Workflow (Optional but Recommended)
1. [x] **Require status checks to pass before merging**
2. Search for the status check name: `check-source-changes` (or `Prevent Source Code Changes`) and select it.
   - *This ensures that if the workflow fails (because someone touched `src/`), they cannot merge.*

### C. Prevent Bypassing (Strict)
1. [x] **Do not allow bypassing the above settings**
   - *Note: As an Admin, you can usually still bypass unless you check "Include administrators".*
2. [x] **Include administrators** (Check this ONLY if you want to stop YOURSELF from accidentally merging without following the rules).

## Step 4: Save
Scroll down and click **Create** (or **Save changes**).

---
**Done!** Now validation is enforced on the remote repository.
