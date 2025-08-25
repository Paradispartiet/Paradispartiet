# Paradispartiet – statisk nettside (GitHub Pages)

Dette er et minimalt oppsett som kan publiseres direkte med GitHub Pages.

## Slik publiserer du

1. Opprett (eller bruk) repoet `Paradispartiet` under brukeren/organisasjonen.
2. Legg inn disse filene i rotmappen (ikke i en `docs/`-mappe, med mindre du velger den i Pages-innstillingene).
3. Commit & push.
4. I GitHub: **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main` (eller `master`), folder: `/root` (eller `/docs` hvis du flytter filene).
5. Vent litt, og åpne `https://<bruker>.github.io/Paradispartiet/`

## Struktur

- `index.html` – forside
- `politikk.html` – politiske punkter (inkl. *Bilfri by*, uten størrelsesangivelse)
- `grunnlag.html` – grunnlagsdokument (kortversjon)
- `manifest.html` – manifest (kan utvides)
- `kontakt.html` – kontakt / innmeldingsknapp
- `404.html` – egen 404-side for GitHub Pages
- `styles.css`, `script.js`
- `assets/logo.svg`, `assets/favicon.svg`

## Tilpasning
- Bytt ut tekstene med fullversjonene dine når de er klare.
- Legg inn faktisk Google‑skjema‑lenke i `kontakt.html`.
- Husk prinsippet: skriv **Bilfri by** uten å oppgi arealstørrelse.
