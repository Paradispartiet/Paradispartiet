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

## Fysen – aktivering fra iPad uten databaseendringer

**Status 20.11.2026:** GitHub-statusen har `not_configured` for DB-01, DB-02, DB-06 og DB-07. Dette forteller at de respektive tokenene ikke er tilgjengelige for den eksisterende arbeidsflyten; det sier ingenting om databaseoppetid. AHA-kontrollen for DB-03/04 virker. Den tilkoblede Supabase-visningen omfatter bare organisasjonen **EchoNet**. Fysen er registrert under en annen organisasjon, **Aha EchoNet**. Ikke opprett nye prosjekter for å rette dette.

1. **Supabase – Fysen:** Åpne [Aha EchoNet](https://supabase.com/dashboard/org/conidfhuuaueyoxwklae/usage) eller [Fysen original](https://supabase.com/dashboard/project/voglczxxtbwcxjrbffbt) og bekreft at **begge** prosjektrefene `voglczxxtbwcxjrbffbt` og `txaopscyxjvvmwawsphk` ligger under organisasjonen du er innlogget på. Opprett en **organisasjonsavgrenset** personlig tilgangsnøkkel i Supabase med bare **Project Settings: Read** (eventuell nyere benevnelse: prosjektinnstillinger lesing) for denne organisasjonen, slik at begge de eksisterende prosjektene kan kontrolleres. **Ikke** velg fullt kontotilgangsnivå, SQL-/Database-skrivetilgang, API Keys eller Auth-tilganger. En token avgrenset til bare ett prosjekt kan ikke kontrollere begge med dette oppsettet.
2. **Cloudflare – Fysen:** I [Cloudflare Dashboard](https://dash.cloudflare.com/097bca85df0240062216f5d74efc0b30/workers/d1) bekreft at DB-06 og DB-07 tilhører konto `097bca85df0240062216f5d74efc0b30`. Opprett en API-token med kun **Account → D1 → Read**, avgrenset til denne kontoen; ikke D1 Write, global API key eller API Token Edit. Merk at D1 Read kan ha tilgang til databaseinnhold dersom tokenet misbrukes, selv om **denne** arbeidsflyten kun henter metadata.
3. **GitHub:** Åpne [Repository secrets](https://github.com/Paradispartiet/Paradispartiet/settings/secrets/actions) → **New repository secret**. Opprett `PARADISDB_SUPABASE_FYSEN_READ_TOKEN` med Supabase-tokenet og `PARADISDB_CLOUDFLARE_FYSEN_D1_READ_TOKEN` med Cloudflare-tokenet. Nøklene skal bare limes inn i GitHubs hemmelige felter, **aldri** i chat, issues, GitHub-kode, Actions-logger eller skjermbilder.
4. **Kontroller resultatet:** Åpne [ParadisDB provider status – Actions](https://github.com/Paradispartiet/Paradispartiet/actions/workflows/paradisdb-provider-status.yml) → **Run workflow → main** én gang. Kontroller at både `Check metadata-only probe` og `Refresh public allowlisted provider metadata` lykkes, og se `docs/paradisdb-provider-status.json`. DB-01/02 skal få `verified` med Supabase-prosjektstatus (ikke nødvendigvis `ACTIVE_HEALTHY` på grunn av tidligere kvoteproblemer); DB-06/07 skal få `verified` og `METADATA_READABLE`. Ved `not_found_in_scope` kontroller organisasjon og prosjektref før noen kodeendring; ved `lookup_failed` kontroller tokenrettighet og om kontoen har tilgang. Ikke tolk disse resultatene som datatap eller databasefeil.

**Ferdigkriterium:** Alle fire Fysen-postene må ha datert, faktisk leverandørkontroll; alle fire skal fortsatt vise sin egen database-ID. **Ikke** bekreft at Fysen kan skrive til PostgreSQL, at gratisgrensene er opphevet, at Cloudflare D1 er produksjonskoblet, eller at noen data er migrert basert på bare metadata. Ingen betalte abonnementer, databaseimporter, backup-eksporter eller flytting er del av oppsettet.

Kilder for minste privilegium: [Supabase personlige tilgangstokener](https://supabase.com/docs/guides/platform/personal-access-tokens), [Cloudflare Get D1 Database](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/get/), [GitHub Actions repository secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

## Kjøring og begrensninger

Workflow: .github/workflows/paradisdb-provider-status.yml. Ordinær kontroll er planlagt kl. **06:17 UTC hver dag**. En reserve er planlagt kl. **18:47 UTC** hvis ordinær status uteble, ble foreldet eller inneholder oppslagsfeil. Reserven sjekker den offentlige statusfilen først og **hopper over leverandøroppslag** når et vellykket resultat er under 18 timer gammelt. Begge kjøringer er bare metadata-/GET-lesing. Arbeidsflyten kan også startes manuelt via GitHub Actions → Run workflow på main. GitHub garanterer ikke at `schedule`-hendelser utløses presist eller i det hele tatt, så reservekjøringen er risikoreduksjon, ikke en garanti.

Den kjører Node-tester først. Hvis ingen lesetoken er lagt inn, gjøres ingen leverandørkall eller commits. Ved kontroll publiserer GitHub Actions bare den hvitelistede JSON-statusen til main med GITHUB_TOKEN. Hvis grenbeskyttelse nekter dette, feiler arbeidsflyten; den skal ikke anses godkjent.

AHA kan lese statusfilen som et supplement til hovedregisteret når visningen støtter kilde, timestamp og foreldet-status. Dette er ikke backupkontroll, bruker-RLS-test, dataintegritetskontroll, Cloudflare Worker-bindingstest eller faktisk synkronisering av databaseinnhold.

**Ingen Azure-restart eller databasedataflytting er tillatt i dette arbeidet.**
