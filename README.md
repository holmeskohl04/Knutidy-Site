# Knutify Website

Static marketing website for Knutify.

## Files

- `index.html` - main page
- `privacy.html`, `terms.html` - **draft** Privacy Policy and Terms of Use (marked `noindex`; review before publishing)
- `404.html` - page-not-found page (self-contained; GitHub Pages serves it automatically)
- `styles.css` - site styling and brand palette
- `script.js` - navigation, Concept Lab demonstrations, and contact form behaviour
- `robots.txt`, `sitemap.xml` - search engine files for `https://knutify.ca`
- `site.webmanifest` - app name and icons for browsers and home screens
- `assets/` - logos, icons, and the social sharing image (`og-image.png`)

## Before Launch

The site is configured for `https://knutify.ca` (canonical link, Open Graph URLs, sitemap, robots.txt).

1. Point `knutify.ca` at the host. On GitHub Pages, set the custom domain under **Settings > Pages**, enable **Enforce HTTPS**, and add the DNS records GitHub lists.
2. Connect the contact form (below), or keep the email fallback.
3. Have the owner and a legal professional complete and review `privacy.html` and `terms.html`. Then remove their `noindex` tags, add their canonical links, and list them in `sitemap.xml` (each file has a comment explaining this).
4. After launch, check the social preview with a sharing debugger, and submit `https://knutify.ca/sitemap.xml` in Google Search Console.

## Connecting The Contact Form

The contact form is **not connected to an online form service yet**. Until it is, the
form's `action` is `mailto:holmeskohl04@gmail.com`: after the visitor's entries pass
validation, the site opens their email app with a pre-filled message to that address.
Nothing is posted anywhere, and the form tells visitors it sends through their email app.

To receive submissions online with [Formspree](https://formspree.io):

1. Create a Formspree account and a new form. Use the email address that should receive enquiries.
2. Copy the form endpoint Formspree gives you. It looks like `https://formspree.io/f/abcdwxyz`.
3. In `index.html`, find `<form class="contact-form" ...>` and:
   - replace `action="mailto:holmeskohl04@gmail.com"` with `action="https://formspree.io/f/abcdwxyz"` (your endpoint), and
   - remove `enctype="text/plain"`.
4. Load the site, send a test enquiry, and confirm it arrives. Formspree may ask you to verify the first submission.

Once the action is an `https://` URL, `script.js` sends the form in the background and shows
a sending, success, or error message. If sending fails, visitors are offered the email
fallback with their message filled in. The hidden `_gotcha` field is Formspree's spam trap.
If the action still contains the placeholder `YOUR_FORM_ID`, the script falls back to email
instead of posting to it.

Any service that accepts a standard form POST and returns a 2xx status works the same way.

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
