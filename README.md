# Knutify Website

Static marketing website for Knutify.

## Files

- `index.html` - main page
- `styles.css` - site styling and brand palette
- `script.js` - menu and interactive system preview behavior
- `assets/` - logos and images

## Upload To GitHub In The Browser

1. Create a new GitHub repository.
2. Choose **Add file > Upload files**.
3. Drag all files and folders from this folder into GitHub.
4. Commit the upload.

## Push With Git

Run these commands from this folder:

```powershell
git init
git add .
git commit -m "Initial Knutify website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Replace `YOUR-USERNAME` and `YOUR-REPO` with your GitHub username and repository name.

## Publish With GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Set **Source** to **Deploy from a branch**.
4. Select branch `main` and folder `/root`.
5. Save.

GitHub will publish the site after the first Pages build finishes.
