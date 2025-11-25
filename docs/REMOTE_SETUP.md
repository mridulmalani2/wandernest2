# Linking this repo to GitHub

You can confirm whether a GitHub remote is already configured and wire one up if missing.

## 1) Check the current remote
- Run `git remote -v` in the project root.
- If you see a URL for `origin`, the repo is already linked and you can push with `git push`.

## 2) Add the remote if none is set
- Create/locate the GitHub repository you want to use.
- Add it as the default origin (HTTPS example):
  ```bash
  git remote add origin https://github.com/<your-username>/<repo-name>.git
  git remote -v
  ```
- Prefer SSH if you have keys configured: `git remote add origin git@github.com:<your-username>/<repo-name>.git`.

## 3) Push the current branch
- Confirm you are on the branch you want to publish (e.g., `git checkout work`).
- Push with upstream tracking so future pushes are simple:
  ```bash
  git push -u origin work
  ```
- If your GitHub account uses 2FA, provide a Personal Access Token instead of a password when pushing over HTTPS.

## 4) After the first push
- Subsequent pushes can use `git push`.
- If Vercel is connected to the GitHub repo, each push will trigger a deployment automatically (ensure environment variables are set in Vercel).
