# ParadisDB – daglig leverandørstatus (bare metadata)

**Hovedregister:** docs/DATABASE_REGISTER.md. Den avledede statusfilen docs/paradisdb-provider-status.json er bare tidsstemplet leverandørstatus, ikke et nytt register eller synkronisering av prosjektdata.

## Hva kontrolleres?

- Supabase: kun Management API GET /v1/projects/{ref} for hver eksplisitt registrerte prosjektreferanse, med kontroll av organisasjons-ID. Dette er kompatibelt med prosjektavgrensede PAT-er med Project Settings: Read. Ingen SQL, innhold, brukere eller nøkler hentes.
- Cloudflare: kun GET /accounts/{account_id}/d1/database/{database_id} med D1 Read-token. Kontrollerer UUID/navn og eventuelt antall tabeller og filstørrelse. Lesbar metadata betyr ikke at appen fungerer.
- Azure DB-05: ingen forespørsler, ingen aktivering.
- Ingen API-token, råresponser eller persondata publiseres.
- Manglende token blir not_configured; API-feil blir lookup_failed; prosjekt som ikke finnes innenfor rett organisasjon blir not_found_in_scope. Dette betyr ikke at databasen er slettet.
- Kontrolltidspunkt vises per database. Målinger eldre enn 48 timer skal vises som foreldet, aldri som live.

## Oppsett – GitHub repository secrets

Legg inn bare de tokenene du vil aktivere i Paradispartiet/Paradispartiet → Settings → Secrets and variables → Actions:

1. **PARADISDB_SUPABASE_ECHONET_READ_TOKEN** – EchoNet-organisasjonen for DB-03/04; finmasket Projects: Read.
2. **PARADISDB_SUPABASE_FYSEN_READ_TOKEN** – separat Aha EchoNet-organisasjon for DB-01/02; Projects: Read.
3. **PARADISDB_CLOUDFLARE_FYSEN_D1_READ_TOKEN** – bare D1 Read i Fysen-kontoen, for DB-06/07.

Ikke legg tokens i kode, chat, issues eller dokumenter. Ikke opprett nye betalte tjenester. Cloudflare-konto-ID er offentlig dokumentert i registeret, men verifiser at DB-06 og DB-07 ligger i samme konto før aktivering.

## Kjøring og begrensninger

Workflow: .github/workflows/paradisdb-provider-status.yml. Ordinær kontroll er planlagt kl. **06:17 UTC hver dag**. En reserve er planlagt kl. **18:47 UTC** hvis ordinær status uteble, ble foreldet eller inneholder oppslagsfeil. Reserven sjekker den offentlige statusfilen først og **hopper over leverandøroppslag** når et vellykket resultat er under 18 timer gammelt. Begge kjøringer er bare metadata-/GET-lesing. Arbeidsflyten kan også startes manuelt via GitHub Actions → Run workflow på main. GitHub garanterer ikke at `schedule`-hendelser utløses presist eller i det hele tatt, så reservekjøringen er risikoreduksjon, ikke en garanti.

Den kjører Node-tester først. Hvis ingen lesetoken er lagt inn, gjøres ingen leverandørkall eller commits. Ved kontroll publiserer GitHub Actions bare den hvitelistede JSON-statusen til main med GITHUB_TOKEN. Hvis grenbeskyttelse nekter dette, feiler arbeidsflyten; den skal ikke anses godkjent.

AHA kan lese statusfilen som et supplement til hovedregisteret når visningen støtter kilde, timestamp og foreldet-status. Dette er ikke backupkontroll, bruker-RLS-test, dataintegritetskontroll, Cloudflare Worker-bindingstest eller faktisk synkronisering av databaseinnhold.

**Ingen Azure-restart eller databasedataflytting er tillatt i dette arbeidet.**
