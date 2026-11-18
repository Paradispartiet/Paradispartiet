# Paradispartiet – felles databaseregister

**Oppdatert:** 18. november 2026  
**Hovedregister:** Denne filen er den felles oversikten for AHA/EchoNet, Fysen, History GO/Civication, HG Film Producer, Football Manager, Paradisavisa, Paradisradioen og nye prosjekter. Ikke opprett konkurrerende hovedregistre.  
**Omfang:** Faktiske hostede databaser, relevante lokale datalagre, sikkerhetskopier og planlagte flyttinger. Her lagres **aldri** passord, connection strings med hemmeligheter, service-role keys, tokens eller persondata.

## Slik leses status

- **Kontrollert 16.11:** Direkte kontroll via tilkoblet Supabase-konto eller repository.
- **Dokumentert:** Bekreftet i kildekode, eksisterende driftsdokumentasjon eller brukerens funksjonstest, men ikke kontrollert mot leverandørens live-instans i dag.
- **Uavklart:** Eksistens, kapasitet, innhold, tilkobling eller eierforhold må undersøkes.
- **Planlagt:** Ikke tell som ferdig opprettet eller migrert.
- **Aktiv tjeneste** er ikke det samme som **fungerende skrivetilgang eller tilstrekkelig kvote**.

## 1. Hostede databaser – hovedtabell

| ID | System | Leverandør / miljø | Prosjekt / identifikasjon | Plassering / konto | Status 16.11.2026 | Neste kontroll |
|---|---|---|---|---|---|---|
| **DB-01** | Fysen – original | Supabase PostgreSQL 17 / produksjonshistorikk | `fysen`, ref `voglczxxtbwcxjrbffbt` | `eu-west-1`; org **Aha EchoNet**, ID `conidfhuuaueyoxwklae` | **Kontrollert 16.11:** SQL lesbar; 1 590 MB i selve databasen; prosjekt-API `ACTIVE_HEALTHY`. **Dashboard 16.11:** organisasjonen bruker **1 682 / 500 MB** og viser rød **«Services restricted»**. Produksjonsskriving er ikke verifisert. | Prioriter trygg avlastning, eksport og migrasjonskontroll. Ikke slett data eller endre betalingsplan. |
| **DB-02** | Fysen – recovery | Supabase PostgreSQL 17 / gjenopprettingsprosjekt | `fysen-recovery-free`, ref `txaopscyxjvvmwawsphk` | `eu-west-1`; samme org som DB-01 | **Kontrollert 16.11:** `ACTIVE_HEALTHY`; SQL lesbar; 60 MB. **Samme organisasjonskvote og tjenestebegrensning** som DB-01. Ingen påstand om komplett produksjonsdatabase. | Verifiser datadekning, avhengigheter, faktisk skrivetilgang og sikkerhet. |
| **DB-03** | AHA – eksisterende MVP / Auth | Supabase PostgreSQL 17 + Auth | `AHA`, ref `wshmybqyksrwkawqleiz` | Org **EchoNet**, ID `kepuwrsiqhqwfgijzpev`; **adskilt fra Fysen** | **Direkte kontroll 18.11:** API `ACTIVE_HEALTHY`, `eu-west-1`, PostgreSQL 17. Databasen `postgres` er **23 MB** (24 218 771 byte; ikke samme tall som organisasjonsforbruk). **26/26 `public`-tabeller har RLS aktivert.** 13 tabeller i legacy AHA preflight: **8 `POLICY_PREFLIGHT_OK`, 5 `MISSING_TABLE`** (én innsiktskammer, fire Insta-relasjoner). Supabase viser eksisterende profil-/kilde-/import-/embeddingrader; ingen innholdsrader ble hentet i audit. | Rett manglende skjema *etter* backup og gjennomgang; undersøk sikkerhetsvarsler, bekreft hosted isolasjon med to reelle testbrukere før sky-write/synk. |
| **DB-04** | AHA – staging | Supabase PostgreSQL 17 / test | `AHA Staging`, ref `sstuzwppsheivczyqrim` | Org **EchoNet** | **Direkte kontroll 18.11:** `INACTIVE` (pauset). Ikke tilgjengelig for vanlige SQL-/app-tester. | Ikke reaktiver uten behov og kostnadsbeslutning; staging er ikke produksjonsdatabase. |
| **DB-05** | AHA – tidligere canonical production | Azure Database for PostgreSQL Flexible Server **16**, database `aha` | Privat Azure production, eksakt server-ID/hostname ikke registrert offentlig | Azure **North Europe**, privat VNet / DNS; ressursgruppe og driftssecrets i beskyttet Azure/GitHub-infrastruktur | **Brukeropplysning 16.11.2026: Azure måtte deaktiveres etter uventet regning på 1 200 (valuta/fakturaperiode ikke kontrollert). IKKE AKTIV PRODUKSJON.** Tidligere GitHub-dokumentasjon om aktiv toprofil-pilot er historisk og kan være foreldet. **Bruker bekrefter 16.11.2026 at Azure har sluttet å fakturere.** Eksakt ressursstatus, data og backup er **ikke verifisert live**. | Hold deaktivert. Fakturering oppgitt stoppet; ingen reaktivering eller ny kostnad. Bekreft eventuelt kun ressursstatus uten aktivering eller opprettelse. Avklar databevaring og eksport-/restore-mulighet uten kostnader før eventuell videre avvikling. Ingen nye Azure-deploys. |
| **DB-06** | Fysen – ParadisDB preview | Cloudflare D1 / test | `paradisdb-fysen-preview`, ID `8b6616b4-11df-4ddc-9817-378f51ee0b69` | Cloudflare-konto `097bca85df0240062216f5d74efc0b30`, EU-jurisdiksjon oppgitt | **Dokumentert 18.11:** separat preview registrert i Fysen PR #1204. Ikke godkjent fjernimport eller Worker-API. Ikke live-verifisert i dag. | Kontroller tabeller, kapasitet og faktiske bindinger før bruk. |
| **DB-07** | Fysen – ParadisDB permanent offentlig | Cloudflare D1 / planlagt katalog | `paradisdb-fysen-public`, ID `882a3393-71c3-43f9-9dec-efc2bbcab409` | Cloudflare Workers Free, EU-jurisdiksjon/Eastern Europe fra manuell kontroll | **Dokumentert 13.11:** Opprettet; 0 brukertabeller, 12,29 kB lagring; 2 spørringer, 3 rader lest, 0 skrevet. Ikke importert/produksjonskoblet. Nåværende status ikke live-verifisert. | Verifiser Free-kvoter, backup og importkostnad før godkjenning. |

**Direkte lenker**

- [DB-01 · Supabase Fysen](https://supabase.com/dashboard/project/voglczxxtbwcxjrbffbt)
- [DB-02 · Supabase Fysen recovery](https://supabase.com/dashboard/project/txaopscyxjvvmwawsphk)
- [DB-03 · Supabase AHA](https://supabase.com/dashboard/project/wshmybqyksrwkawqleiz)
- [DB-04 · Supabase AHA Staging](https://supabase.com/dashboard/project/sstuzwppsheivczyqrim)
- [DB-05 · AHA Azure-infrastruktur og operativ status](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/docs/AHA_AZURE_PRODUCTION_PLATFORM_V1.md)
- [DB-06 · Cloudflare D1 preview Settings](https://dash.cloudflare.com/097bca85df0240062216f5d74efc0b30/workers/d1/databases/8b6616b4-11df-4ddc-9817-378f51ee0b69/settings)
- [DB-07 · ParadisDB permanent D1 – documented remote check](https://github.com/Paradispartiet/fysen/blob/feature/paradisdb-local-pilot-v1/tools/paradisdb/worker/FYSEN_FIRST_REMOTE_CHECK.md)

### DB-01 og DB-02 – tekniske kontrollfakta 16. november

| Kontroll | DB-01 original | DB-02 recovery |
|---|---:|---:|
| `pg_database_size(current_database())` | 1 667 230 867 byte (**1 590 MB**) | 62 502 579 byte (**60 MB**) |
| PostgreSQL engine | 17 | 17 |
| `pg_is_in_recovery()` | `false` | `false` |
| `default_transaction_read_only` | `off` | `off` |
| `transaction_read_only` | `off` | `off` |
| Applikasjonsskjema `fysen` | 30 tabellrelasjoner | 29 tabellrelasjoner |
| Prosjekt-API | `ACTIVE_HEALTHY` | `ACTIVE_HEALTHY` |

**Tolkning:** Disse lesebaserte kontrollene viser at serverne svarer og at den inspiserte SQL-sesjonen ikke er read-only. De beviser **ikke** at Fysens produksjonsapplikasjon har fungerende skrivetilgang, at API-ene er friske eller at organisasjonens Free-forbruksgrenser er opphevet. **Brukers dashboard 16.11 viser 1 682 / 500 MB for hele Fysen-organisasjonen, med rød «Services restricted»**; dette er forskjellig fra størrelsen på DB-01 alene (1 590 MB).

**Sikkerhetsvarsel:** Supabase-verktøyet flagget `public.spatial_ref_sys` med RLS deaktivert i begge Fysen-prosjekter. Dette er en PostGIS-relatert tabell. Undersøk faktisk eksponering, rettigheter og nødvendige policyer før eventuelle endringer; **ikke** aktiver RLS blindt eller kjør automatisk SQL-retting.

### Nye kontroller av Fysen og AHA – 16. november 2026

**Fysen DB-01, direkte skrivefri SQL-inspeksjon:** De største tabellene er `fysen.menu_items` **1 323 MB** (ca. 722 MB data og 601 MB indekser), `menu_snapshots` **102 MB**, `menu_changes` **97 MB** og `menu_watch_runs` **39 MB**. Eksakte radtellinger på kontrolltidspunktet: `menu_items` **1 709 517**, `menu_snapshots` **34 447**, `menu_changes` **54 472**, `menu_watch_runs` **111 963** og `restaurants` **1 116**. Denne store **historikk-/databasebeholdningen** er **ikke** den samme som den offentlige Fysen-gratisindeksen på 973 restauranter / 47 265 poster. En liten offentlig D1-katalog er dermed ikke dokumentasjon på at hele historikken er flyttet.

**Supabase-organisasjonene ifølge brukers dashboard 16.11:**

- **Aha EchoNet:** Inneholder prosjektene `fysen` og `fysen-recovery-free`; **1 682 / 500 MB** samlet Free-forbruk; **«Services restricted»**.
- **EchoNet:** Inneholder `AHA` (ikke merket pauset i prosjektlisten) og `AHA Staging` (**pauset**); samlet databaseforbruk **39 / 500 MB**, **3 månedlig aktive brukere**. Ikke tolk 39 MB som individuell størrelse på AHA-prosjektet.
- Disse organisasjonene er **adskilte**. Fysens kvoteproblem er **ikke i seg selv bevis** for at AHA er kvotebegrenset. AHA Supabase/Auth må prøves separat. **Azure canonical (DB-05) er brukeroppgitt deaktivert etter regning og må ikke behandles som tilgjengelig backend.**

**AHA Cloudflare Pages, brukerprøve 16.11:** Feed-innlegg og bildevalg for Insta fungerer i lokal nettleserlagring. [PR #1039](https://github.com/Paradispartiet/AHA-EchoNet/pull/1039) og [PR #1041](https://github.com/Paradispartiet/AHA-EchoNet/pull/1041) er merget med grønne tester; #1041 gir preview-spesifikk Supabase PKCE callback og sperre mot automatisk legacy chamber-sync. **Bruker har kjørt den manuelle Cloudflare-publiseringen og vist skjermbilde fra iPad 16.11:** AHA Home vises med riktig layout og tidligere lokal innsikt «Hei»; dermed **er frontendvisning på Cloudflare-preview brukerbekreftet**. GitHub Actions-deploylogg for denne manuelle kjøringen og nøyaktig deploy-SHA er ikke uavhengig kontrollert her. **Bruker oppgir 16.11 at AHA-innloggingen fungerer på Cloudflare-preview etter oppdatert redirect.** Supabase Auth er dermed **funksjonstestet av bruker**, men sesjon etter sideoppdatering, faktisk profilrad, RLS, databasepersistens, AI-backend og privat synk er **ikke separat verifisert**. **Azure canonical er deaktivert ifølge bruker**; ingen datamigrering er utført.

**AHA-profiltest på iPad 16.11:** Bruker viste `profile.html` («Mitt AHA») med **«Lokal AHA-bruker» / «Lokal modus»**, to lokale arbeidsobjekter (én innsikt og én kilde), og tekst **«Ingen EchoNet-identitet er aktivert»**. GitHub-koden for `profile.html` bekrefter at dette er en **lokal statusflate**, ikke skjermbildebevis på Supabase Auth. **Dette tidligere skjermbildet dokumenterer bare lokal profilstatus.** Brukeren har i en etterfølgende test 16.11 **bekreftet at innlogging fra AHA Home fungerer** på Cloudflare-preview. Faktisk profilrad, RLS og sky-synk er fortsatt ikke kontrollert; ingen automatisk privat dataimport.

**AHA lesebasert profilsjekk – implementert, ikke live-testet 16.11:** [PR #1042](https://github.com/Paradispartiet/AHA-EchoNet/pull/1042) **merget** som `b6830030`; **6/6 CI-kontroller grønne**, inkludert Node- og iPad WebKit-gate. `profile.html` skiller nå eksplisitt lokal profilstatus fra Supabase Auth og har manuell knapp «Kontroller Supabase-konto». Koden verifiserer `auth.getUser()` og leser **kun innlogget brukers egen `aha_profiles.id`** i det forventede AHA-prosjektet. Ingen autoimport eller databaseskriving. **Manuell Cloudflare-preview-deploy fra `main` og faktisk knapperesultat på iPad gjenstår**; dette er ennå ikke bevis på RLS-isolasjon eller privat sky-sync.

**AHA legacy RLS-sikkerhetsport – 16.11:** [PR #1045](https://github.com/Paradispartiet/AHA-EchoNet/pull/1045) er **merget til `main`** som `0a686456`; **7/7 CI-kontroller bestod**, inkludert den nye isolerte PostgreSQL 16-testen av to **syntetiske** brukere og 12 legacy-tabeller. Testen viser at policyene i kildekoden isolerer testbrukere ved lokale Postgres-betingelser, og at anonym lesing av testdata avvises. Den nye katalogspørringen `supabase/audits/aha_legacy_readonly_preflight.sql` bruker `BEGIN READ ONLY` og kan utføres av kontoeier i **riktig AHA Supabase-prosjekt DB-03** for å inspisere reelle policyer uten personinnhold eller skriving. **Oppfølging:** [PR #1046](https://github.com/Paradispartiet/AHA-EchoNet/pull/1046) er **merget** som `c53fa0d6` med **7/7 grønne CI-kontroller**. Den utfører nå **selve** read-only katalog-SQL-en mot en isolert, syntetisk PostgreSQL-fixture med resultat **12/12 kjernetabeller `POLICY_PREFLIGHT_OK`** og forventet manglende valgfri embeddings-tabell; shell-testen er låst til lokal CI-database med egen syntakssperre. **SQL-en er fortsatt ikke kjørt mot faktisk AHA-database, og ingen reell profilrad, hosted to-bruker-isolasjon eller backup er verifisert.** Ingen ny database, flytting eller Azure-aktivering.

**AHA Supabase-grants kontrollert i syntetisk miljø 16.11:** [PR #1048](https://github.com/Paradispartiet/AHA-EchoNet/pull/1048) er **merget** som `0af3b6b1` med **7/7 grønne CI-kontroller**. Det eksisterende skrivebeskyttede SQL-skriptet kontrollerer nå også at `authenticated` har nødvendige `SELECT`, `INSERT` og `UPDATE`-rettigheter på hver tabell, og rapporterer `REVIEW_MISSING_TABLE_GRANT` ved mangler. Negativ test med midlertidig fjernet UPDATE-grant på `aha_notes` bestod **kun mot disponibel testdatabase**; grant ble gjenopprettet i testen. **Ingen direkte AHA Supabase-tilgang:** den tilkoblede Supabase-identiteten viser fortsatt bare Fysens to prosjekter; direkte `get_project` for DB-03 avvises med manglende rettigheter. Live-audit og profillagring for AHA er fremdeles **ikke kontrollert**.

**AHA Auth-profilskriving – ny oppdagelse 16.11:** Gjennomgang av `js/ahaAuth.js` og `js/ahaAuthCallback.js` avdekket at login/status/callback kan gjøre automatisk `upsert` av `public.aha_profiles`, **selv om previewets legacy chamber-sync er sperret**. Tidligere Cloudflare-innlogging kan derfor ha opprettet/oppdatert profilrad; hosted effekt er uavklart uten EchoNet-database-tilgang. [AHA PR #1049](https://github.com/Paradispartiet/AHA-EchoNet/pull/1049) er **merget til `main` 16.11** som `dd8f3f44`, med **7/7 grønne CI-kontroller**, inkludert ny offline test for Auth og PKCE callback. Den sperrer kjente automatiske profil-`upsert` **kun i kopierte Cloudflare-preview-Auth-skript** (ikke GitHub Pages); innlogging kan fortsatt lese eksisterende profil. **Ny manuell Cloudflare-deploy er ikke kjørt, så sperren er ennå ikke bekreftet på iPad.** Faktisk Supabase-innlogging/hosted RLS og private data skal ikke få ny sync før kontroll.

**AHA Cloudflare-preview Data API og lokal Feed – status 18.11:** [PR #1052](https://github.com/Paradispartiet/AHA-EchoNet/pull/1052) er **merget** som `c1d3abe` etter **7/7 grønne CI-workflows** på PR-head (Node, Engine, syntax, launch gate, syntetisk RLS-rehearsal, Cloudflare-pakkekontroll og browser-gate). Feed er nå lokal som standard: ny post, sletting og kildebehandling gir ikke automatisk database-sync; «Send til AHA» er en eksplisitt brukerhandling og kan starte egne innsikts-/embeddingprosesser. `AHA_CONFIG.feed.enableDatabaseSync === true` kreves for Feed sin database-synk. Cloudflare-preview-byggeskriptet legger dessuten en **preview-spesifikk** Data API-sperre i kopiert `ahaDb.js`: vanlige `insert/upsert/update/delete` og `rpc` avvises før nettverk, mens Auth/SELECT kan fungere. Sperren dekker ikke direkte HTTP/fetch, separate Supabase-klienter, Storage/Edge Functions eller hosted RLS. **GitHub Pages-deploy av mergecommit er grønn 18.11; ny manuell Cloudflare-preview-deploy er ikke gjennomført/bekreftet.** **Etter kontobytte 18.11 er DB-03 direkte tilgjengelig og live RLS/grants-katalogkontroll kjørt**, med 8/13 OK og 5 manglende tabeller. Hosted tobruker-isolasjon og backup/restore er **ikke** kontrollert. Ingen sky-synk, privat import eller Azure er aktivert.

### AHA DB-03 – direkte skrivefri Supabase-sikkerhetskontroll (18. november 2026)

- **Konto bekreftet:** Supabase-organisasjon `EchoNet` (`kepuwrsiqhqwfgijzpev`), aktivt prosjekt `wshmybqyksrwkawqleiz`. Tilkoblingen er nå til riktig organisasjon, ikke Fysens `Aha EchoNet`.
- **Utført:** Det versjonerte `supabase/audits/aha_legacy_readonly_preflight.sql` ble kjørt som `BEGIN READ ONLY` på faktisk DB-03. Av 13 forventede `public.aha_*`-tabeller ga **8 `POLICY_PREFLIGHT_OK`** (profiler, kildehendelser, notater, galleri, Feed, Insta-innlegg, importer, embeddings). **5 `MISSING_TABLE`**: `aha_insight_chambers`, `aha_insta_profiles`, `aha_insta_likes`, `aha_insta_comments`, `aha_insta_follows`. Katalogpolicyer og grants er vurdert, **ikke** virkelig brukerisolasjon eller Data API-lesing via en autentisert klient.
- **Hele `public`-skjemaet:** 26 vanlige tabeller, **alle har RLS på**. Dette er ikke bevis på korrekt policyinnhold i hver HG-/venne-tabell. Flere AHA-tabeller har `anon`-tabellgrants, men aktiv RLS; API-tilgang og sesjonsisolasjon må også testes.
- **Lagringsomfang:** `pg_database_size(current_database())` er **23 MB** / 24 218 771 byte for databasen `postgres`, ikke lik tidligere dashboard-observasjon av organisasjonskvoten. Aggregert metadata viser noe privat profil-, kilde-, import- og embeddinginnhold; ingen enkeltposter eller tokens er eksportert.
- **Supabase Security Advisors:** Varsler om `public.aha_match_insights` sin ufast `search_path`, to privilegerte men `authenticated`-tilgjengelige `SECURITY DEFINER`-funksjoner (`aha_open_social_meet_chat`, `aha_report_direct_chat`), `vector`-utvidelsen i `public`, passordlekkasje-beskyttelse av og tre RLS-tabeller uten policy i private `aha_friend_private`. **Vurderingsfunn**, ingen påvist lekkasje og ingen automatisk endring.
- **Tilleggstest 18.11 – faktisk DB-03, rollebasert med to profilidentiteter:** En `BEGIN READ ONLY`-transaksjon på `wshmybqyksrwkawqleiz` simulerte `authenticated` og to ulike, eksisterende profil-ID-er via lokale JWT-claim-innstillinger. For **begge** var `auth.uid()` lik den simulerte eieren, nøyaktig én profilrad synlig, og **0 fremmede rader** synlige i `aha_profiles`, `aha_source_events`, `aha_imports` og `aha_insight_embeddings`. Egen kilde-/import-/embeddingdata var synlig der det fantes, som positiv kontroll. Ingen bruker-ID-er/innhold ble eksportert. Dette er **hosted SQL-rolleprøve, ikke ekte Supabase Auth/PostgREST-test med to aktive sesjoner**; Feed/Insta-posttabellene var tomme og er ikke dataprøvd på denne måten.
- **Feed-sikkerhet 18.11:** [AHA PR #1060](https://github.com/Paradispartiet/AHA-EchoNet/pull/1060) merget til `main` som `536bbbf` etter 7/7 grønne PR-kontroller. Automatisk skyopplasting fra lokal Feed og innblanding av fremmede skyposter i den gamle delte `localStorage`-nøkkelen er fjernet, og HTML-attributter escapes. Skriving/synk i Cloudflare er fortsatt **ikke aktivert**, og cloud-preview er fortsatt manuelt publisert.
- **Utvidet 18.11 – null-/fremmede eierrader:** Ny faktisk DB-03-`READ ONLY`-rolletest med to simulerte `authenticated`-profilidentiteter, seks tabeller og `IS DISTINCT FROM auth.uid()` bestod **12/12**: begge så egen profilrad, og ingen fikk synlige fremmede **eller eierløse** rader fra profiler, kilder, importer, embeddings, Feed eller Insta. Feed/Insta-tabellene var tomme ved tidligere kontroll; dette er derfor **ikke** full datadekning. Det var ingen innholds-/ID-eksport eller databaseendring. [AHA PR #1062](https://github.com/Paradispartiet/AHA-EchoNet/pull/1062) har i utkast en eksplisitt browser/Data API-lesetest med HEAD/count (ingen radinnhold). **Ikke påstå reell tobruker Auth/API-isolasjon før knappen er kjørt under to aktive testkontoer.** Cloudflare preview ble manuelt publisert fra `main` commit `536bbbf` med [vellykket Actions-run 44304191797](https://github.com/Paradispartiet/AHA-EchoNet/actions/runs/44304191797); dette var en distribusjon av read-only-kode, **ikke** aktivering av synk eller databasebackup.
- **Gjenstår:** Hosted tobruker-isolasjon med faktiske Auth/Data API-token, kontroll av privilegerte funksjoner, verifiserbar privat sikkerhetskopi og restore. Ikke importer privat innhold, opprett manglende tabeller blindt, aktiver synk eller reaktiver Azure.

## 2. Lokale og filbaserte datalagre – ikke egne hostede databaser

| System | Lagring og kodeplassering | Status / avgrensning |
|---|---|---|
| **Fysen, offentlig gratisindeks** | GitHub-generert `fysen-free-public-index`; kilder i [fysen-repo](https://github.com/Paradispartiet/fysen), offentlig arkiv-API hos Vercel | Dokumentert i drift 12.11 med ca. 973 restauranter og 47 265 menyposter. Et verifisert, begrenset **arkiv**, ikke sanntids-PostgreSQL eller full historikk. |
| **AHA local-first** | Nettleserens `localStorage` samt valgfritt `public.aha_*` på DB-03. Canonical `aha.*` ble tidligere lagret på **Azure DB-05**, som er brukeroppgitt deaktivert; ikke anta fungerende produksjonssynk. | Kode/verifisert arkitektur, men tidligere produksjonsstatus er foreldet. Hver modul må vurderes for seg; lokal lagring er ikke sikkerhetskopi av Azure eller Supabase. |
| **History GO** | [History-Go/data](https://github.com/Paradispartiet/History-Go/tree/main/data), manifest-/JSON-data for steder, quiz, kunnskap m.m. | GitHub-data er ikke egen databaseinstans. FastAPI/Social Meet har PostgreSQL/Supabase-kontrakter under `backend/` og `supabase/`; **faktisk live database-/deploytilkobling er ikke verifisert** i dette registeret. Ikke opprett en oppdiktet separat DB-ref. |
| **Civication** | Del av [History-Go](https://github.com/Paradispartiet/History-Go), bl.a. `data/Civication` | Samme repo som History GO; ingen separat hostet produksjonsdatabase identifisert. |
| **HG Film Producer** | [HG_Film_Producer/data](https://github.com/Paradispartiet/HG_Film_Producer/tree/main/data) og klientlagring der appen bruker dette | Fil-/appdata identifisert. Ingen separat hostet database bekreftet. |
| **Football Manager** | [HistoryGo-FootballManager/data](https://github.com/Paradispartiet/HistoryGo-FootballManager/tree/main/data), appens lokale karriere-/spilltilstand | GitHub-filer identifisert. Eventuell persistent backend/database må undersøkes; ingen separat hostet instans er bekreftet. |
| **Paradisavisa** | [Paradisavisa](https://github.com/Paradispartiet/Paradisavisa) – bl.a. `notiser.json`, `posts.json`, artikler og redaksjonelle JSON-filer | Publisert filbasert innhold, **ikke** en bekreftet ekstern SQL-database. |
| **Paradisradioen** | Samme [Paradisavisa-repo](https://github.com/Paradispartiet/Paradisavisa), nyhetsliste og radiofiler | Ingen separat database bekreftet. Radio/lydfiler er ikke selv en relasjonsdatabase. |
| **EchoNet** | [EchoNet-repo](https://github.com/Paradispartiet/EchoNet) | Eget repo, men ikke grunnlag for å føre opp enda en hostet database. |

### Prosjektkoblinger – alle 18 tilgjengelige GitHub-repositorier

Disse 20 app-/prosjektpostene dekker alle 18 tilgjengelige repoer; flere apper deler repo. «Ingen bekreftet» er ikke bevis på at en database ikke finnes.

| ID | Prosjekt | GitHub-repo | Databaser | Annen lagring | Status |
|---|---|---|---|---|---|
| PRJ-01 | AHA / EchoNet | AHA-EchoNet | DB-03, DB-04, DB-05 | localStorage og filer | AHA aktiv; staging pauset; Azure deaktivert ifølge bruker; sky-synk ikke godkjent |
| PRJ-02 | Fysen | fysen | DB-01, DB-02, DB-06, DB-07 | GitHub, offentlig arkiv, Vercel | Supabase sist kontrollert 16.11; D1-identiteter dokumentert, ingen godkjent migrering |
| PRJ-03 | History GO / Social Meet | History-Go | DB-03 | GitHub JSON | DB-03 har 14 hg-tabeller med RLS; faktisk appkobling uavklart |
| PRJ-04 | Civication | History-Go | — | GitHub JSON | Ingen separat database bekreftet |
| PRJ-05 | HG Film Producer | HG_Film_Producer | — | GitHub og lokal lagring | Ingen separat database bekreftet |
| PRJ-06 | Football Manager | HistoryGo-FootballManager | — | GitHub og lokal lagring | Ingen separat database bekreftet |
| PRJ-07 | Paradisavisa | Paradisavisa | — | Artikler og JSON | Filbasert publisering |
| PRJ-08 | Paradisradioen | Paradisavisa | — | Lydfiler og nyhetsliste | Deler repo med Paradisavisa |
| PRJ-09 | EchoNet prototype | EchoNet | — | localStorage og JSON-eksport | README: statisk prototype uten backend |
| PRJ-10 | Paradispartiet portal | Paradispartiet | — | Statisk GitHub Pages | Ingen egen database dokumentert |
| PRJ-11 | Teorien om lyset | Teorien-om-lyset | — | Uavklart | Repo oppdaget; databasesøk gjenstår |
| PRJ-12 | History Go 2 | History-Go-2 | — | Uavklart | Repo oppdaget; databasesøk gjenstår |
| PRJ-13 | HG | HG | — | Uavklart | Repo tomt ved siste oppslag |
| PRJ-14 | Kunstakademiet | Kunstakademiet | — | Uavklart | Repo oppdaget; databasesøk gjenstår |
| PRJ-15 | Skrivekunstakademiet | Skrivekunstakademiet | — | Uavklart | Repo tomt ved siste oppslag |
| PRJ-16 | Fysen preview | fysen-preview | — | Publiserte forhåndsvisningsfiler | Ingen egen DB bekreftet |
| PRJ-17 | Paradispartiet produksjonshost | Paradispartiet.github.io | — | Publiserte bygg | GitHub Pages-host, ikke databasetjeneste |
| PRJ-18 | Film Producer preview | HG_Film_Producer-preview | — | Preview-filer | Ingen egen DB undersøkt |
| PRJ-19 | Football Manager preview | HistoryGo-FootballManager-preview | — | Preview-filer | Ingen egen DB undersøkt |
| PRJ-20 | History GO preview (avviklet) | History-Go-preview | — | Tidligere preview | README: repo pensjonert |

**Delt database:** AHA Supabase DB-03 har 26 tabeller i `public` med RLS, inkludert 14 `hg_*`-tabeller for History GO Social Meet. Disse tabellene var uten rader ved kontroll 18.11. Tabellene beviser ikke at History GO er koblet til DB-03 i produksjon.

## 3. Backuper, historikk og gjenoppretting

| Registerpost | Sted / bevis | Hva er bevart | Begrensning / kontroll |
|---|---|---|---|
| **BK-01 Fysen historikk 02.11** | **Privat Google Drive**, fire ZIP-deler; [gjenopprettingsrapport](https://github.com/Paradispartiet/fysen/blob/main/docs/fysen-storage-readonly-recovery-2026-11-02.md) | Verifisert dump av **seks** meny-/historikktabeller. Isolert PostgreSQL 17 + PostGIS-restore fullført med korrekte radtall. | **Ikke** komplett Supabase-prosjekt, alle app-tabeller, Auth eller storage-objekter. Ikke slett original ut fra denne alene. |
| **BK-02 Fysen kompakt prøvedatabase 12.11** | [Gratisdrift og isolert test](https://github.com/Paradispartiet/fysen/blob/main/docs/fysen-zero-cost-operating-plan-2026-11-12.md) | Midlertidig isolert Postgres-test på ca. **163,2 MB** etter komprimering. | Test, ikke migrert produksjon. Eldre søkeresultatkoblinger krever særlig bevaring. |
| **BK-03 AHA Azure canonical** | [Azure-operativ dokumentasjon](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/docs/AHA_AZURE_PRODUCTION_PLATFORM_V1.md) | Historisk dokumentert **PITR restore-rehearsal** til separat privat PostgreSQL-server, **ikke** dokumentert fullstendig offline-eksport. | **Azure deaktivert ifølge bruker etter uventet regning.** Eksistens, backup-retensjon, gjenopprettingsadgang og kostnad ved tilgang er uavklart. Ikke reaktiver betalte ressurser kun for sjekk. |
| **BK-04 AHA Supabase DB-03/04** | Riktig Supabase-konto/organisasjon | **18.11:** DB-03 `ACTIVE_HEALTHY`, PostgreSQL-databasen 23 MB; DB-04 staging pauset. **Ingen eksport eller restore er verifisert.** | Verifiser privat, komplett eksport og kontrollert restore før migrering og første automatisk sky-skriving; plan- og backuprettigheter ubekreftet. |
| **BK-05 Cloudflare D1 DB-06/07** | Cloudflare-dashboard og Fysen ParadisDB-pilot | Ingen verifisert backup/restore; DB-07 var tom ved kontrollen 13.11. | Kontroller begge separat før produksjonsendringer. |
| **BK-06 AHA lokal JSON-eksport (verktøy, ikke bekreftet backup)** | [AHA Personvern på Cloudflare-preview](https://aha-preview.aha-echonet-preview.pages.dev/privacy.html), [kildekode](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/privacy.html) og `js/ahaPrivacy.js` | **Verifisert i kode 16.11:** eksplisitt utvalg og nedlasting av lokale AHA-data (Chat, notater, media, samlinger, kunnskap, Personal AI og profil), med redigering av hemmelige felter. Gjenoppretting er lokal, additiv og krever forhåndsvisning og `GJENOPPRETT`. | **Ingen faktisk backupfil fra bruker er mottatt eller verifisert.** Maks 20 MB for lokal restore; eksporter fra riktig nettstedadresse/origin på iPad, lagre fil privat, kontroller innhold og gjenopprettbarhet før eventuelle nye sky-writes. Lokal eksport er **ikke** sikkerhetskopi av Azure eller Supabase. |

## 4. ParadisDB og foreslåtte flyttinger

**ParadisDB** er navnet på arbeidet med en samlet databaseplattform/oversikt, **ikke** bevis på at en felles produksjonsdatabase eller automatisk synk kjører. [Fysen PR #1204](https://github.com/Paradispartiet/fysen/pull/1204) er fortsatt åpen draft 18.11 og gjelder lokal SQLite-/D1-/Worker-pilot for offentlige Fysen-menyer. Det finnes to identifiserte D1-instansnavn, DB-06 (preview) og DB-07 (permanent), som ikke må slås sammen. Ingen av dem er godkjent som felles register for private prosjektdata. DB-07 var tom ved manuell kontroll 13.11. Ingen full migrering eller produksjonsomkobling er utført.

| Forslag | Status | Krav før «fullført» |
|---|---|---|
| Flytte Fysens offentlige katalog fra Supabase DB-01/02 til D1 DB-07 (DB-06 er kun separat preview) | **Ikke bevist utført** | Tabell-/datamapping, datatellinger, integritet, appens read/write-test, deploykobling, rollback og beholdt historisk backup. |
| Frigjøre plass eller avslutte Fysen Supabase | **Ikke godkjent** | Bekreftet ny produksjonsplattform, fullstendig eksport/gjenoppretting, avhengighetskart og eksplisitt beslutning. Ingen destruktiv opprydding automatisk. |
| Flytte AHA legacy DB-03/04 | **Ikke prioritert – behold mens appen ferdigstilles** | EchoNet-organisasjonen har bare 39 / 500 MB samlet forbruk og er separat fra Fysens sperrede organisasjon. Kontroller først innlogging/roller, brukerdata, sync og API fra riktig konto; migrering er ikke nødvendig av hensyn til Fysen. |
| Gjenoppbygge AHA privat synk uten Azure – DB-03 kandidat | **Auth på Cloudflare fungerer ifølge bruker; [PR #1041](https://github.com/Paradispartiet/AHA-EchoNet/pull/1041), [#1042](https://github.com/Paradispartiet/AHA-EchoNet/pull/1042) og [#1045](https://github.com/Paradispartiet/AHA-EchoNet/pull/1045) er merget 16.11.** #1045: **7/7 grønne CI-kontroller** inkludert syntetisk legacy-RLS-isolasjon. **Ingen data migrert; live skrivefri hosted RLS/grants-katalogkontroll 18.11 viste 8 OK / 5 manglende tabeller. Reell tobruker-isolasjon gjenstår.** | (1) Bekreft knapperesultatet «Kontroller Supabase-konto» på Cloudflare-preview; (2) vurder funnene fra utført live preflight og avklar fem manglende tabeller med eksisterende migrasjoner; (3) test to brukere gjennom faktisk AHA Auth/Data API, og kontroller eksport/restore og eksplisitt samtykke før første private write/import. Azure forblir av; auto-synk er sperret i preview. |
| Avviklet AHA Azure canonical DB-05 og eventuell datagjenoppretting | **Brukeroppgitt deaktivert etter regning på 1 200; ikke aktiv** | **Bruker bekrefter at fakturering har stoppet.** Verifiser eventuelt hvilken ressurs som er deaktivert/slettet, og om kanoniske data finnes i backup/eksport. Ikke opprett eller gjenaktiver Azure. Planlegg alternativ backend kun etter kostnads- og datakartlegging. |
| Flytte statiske JSON-kataloger | **Ikke besluttet** | Ikke flytt data bare fordi det finnes D1; dokumenter faktiske behov og appavhengigheter. |

**Felles kostnadsregel for alle prosjekter:** Mål **0 kr i nye faste tjeneste-/databasekostnader**; ingen Azure-reaktivering, nye betalte abonnementer, forbruksbaserte deploys eller fjerning av kostnadsgrenser uten eksplisitt forhåndsgodkjenning. Ikke slett data eller historikk for å presse ned kostnader før verifisert sikkerhetskopi og gjenopprettingsmulighet. Dette garanterer ikke at tidligere påløpte eller andre eksisterende utgifter er null.

**Økonomisk hendelse – Azure/AHA (brukeropplyst 16.11):** Uventet regning på **1 200** førte til deaktivering av Azure. **Bruker bekrefter 16.11 at Azure har sluttet å fakturere.** Eksakt fakturaperiode, valuta og ressurs-/datastatus er ikke kontrollert direkte i Azure. Tidligere statusdokumenter i AHA-repoet beskriver en aktiv toprofil-pilot, men er **historiske** og må ikke brukes som bevis på at Azure fremdeles kjører.

## 5. Neste kontroller – i prioritert rekkefølge

1. **Cloudflare:** Kontroller DB-06 (preview) og DB-07 (permanent) hver for seg, tabeller, data, Worker-bindinger, API-er og reell driftstilkobling. Ingen av dem skal antas å være en aktiv felles registerdatabase.
2. **AHA Supabase:** EchoNet-organisasjonen viser 39 / 500 MB totalt på brukers skjermbilde 16.11; **AHA Staging pauset**. Bruker har bekreftet Cloudflare-preview Auth-innlogging. **PR #1041 og #1042 er merget med 6/6 grønne CI-kontroller hver.** Ny eksplisitt lesekontroll for **egen** AHA-profil ligger i `main`, men er ennå ikke manuelt deployet/verifisert på iPad. Neste test: deploy preview, trykk statusknapp, sjekk profilrad – deretter to-bruker-RLS, sikker eksport/restore og samtykke. Verken en lesbar egen profil eller vellykket Auth er bevis på ferdig privat skylagring eller synk.
3. **Fysen:** Kontroller nåværende organisasjonskvote og faktisk appskriving på DB-01/02 uten å røre produksjonsinnhold; kartlegg full avhengighetsliste før mulig migrasjon.
4. **AHA Azure, deaktivert:** Undersøk bare historisk faktura, ressursoversikt og eventuelle eksisterende backuper **uten** å gjenaktivere, restarte eller opprette betalte ressurser. Bruker har bekreftet at fakturering er stoppet; behold data-/backupstatus som uavklart inntil den er kontrollert.
5. **History GO og øvrige apper:** Verifiser backend-miljøer og faktisk datalagring. Registrer nye hostede instanser med egne ID-er **bare** når de er bekreftet.

## 6. Endringsrutine for registeret

Ved **hver** opprettelse, flytting, deaktivering, kvotehendelse, ny bekreftet leverandørtilkobling, endret databasebruk eller restore-test skal den eksisterende raden oppdateres i **denne filen**. **Kontroller alltid dette hovedregisteret først og oppdater her, ikke i nye separate oversikter.** Minstekrav per post: system, miljø (prod/staging/recovery), leverandør, prosjektref, konto/org, region, hovedinnhold, live status, kapasitet, backup, siste kontroll, dokumentasjonslenke, avhengigheter og neste tiltak. Merk fakta som `kontrollert`, `dokumentert` eller `uavklart`, med dato. En flytting er først «fullført» når dataintegritet, apptilkobling og rollback er verifisert og den tidligere instansen eksplisitt er beholdt eller avviklet etter beslutning.

### Kilder / sporing

- [Fysen – eksisterende Supabase-prosjektregister (11.11)](https://github.com/Paradispartiet/fysen/blob/main/docs/supabase-project-inventory.md)
- [Fysen – historikk og read-only-hendelse (02.11)](https://github.com/Paradispartiet/fysen/blob/main/docs/fysen-storage-readonly-recovery-2026-11-02.md)
- [Fysen – gratisdrift og staging-test (12.11)](https://github.com/Paradispartiet/fysen/blob/main/docs/fysen-zero-cost-operating-plan-2026-11-12.md)
- [AHA – Supabase og canonical databaselag](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/supabase/README.md)
- [AHA – Azure production](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/docs/AHA_AZURE_PRODUCTION_PLATFORM_V1.md)
- [AHA – gjeldende canonical production pilot](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/docs/AHA_CANONICAL_PRODUCTION_PILOT_STATUS.md)
- [History GO – backend/lagring](https://github.com/Paradispartiet/History-Go/blob/main/backend/README.md)

**Begrensning ved denne oppdateringen:** Supabase DB-01/02 ble kontrollert direkte med lesebaserte SQL-spørringer 16.11.2026; detaljerte radtall og tabellstørrelser over er fra denne kontrollen. Organisasjonskvoter og AHA-/staging-pauser er skjermbildeobservasjoner fra bruker 16.11. **Azure-deaktivering, regning på 1 200 og bekreftelse på stanset fakturering er brukeropplysninger**, ikke en live-verifisert kontroll av Azure; skiller mellom historisk deploy og nåværende status. Cloudflare D1 og AHA Azure ble ikke lest live. Ingen databaser, API-tilkoblinger, brukere, produksjonspekere, datainnhold eller betalingsoppsett er endret.

## 7. ParadisDB – samlet metadatafeed

**Mål:** Registrer lokasjon, konto, miljø, database-ID, tilknyttede prosjekter, status, backup og siste kontroll. Dette gjelder metadata, ikke kopiering av private data.

- `docs/DATABASE_REGISTER.md` er fortsatt det **eneste redaksjonelt vedlikeholdte hovedregisteret**.
- `docs/paradisdb-inventory.json` er en maskinlesbar eksport fra denne filen, generert med `tools/build_paradisdb_inventory.py`. En avgrenset CI-kontroll hindrer at JSON og hovedregister avviker ved merge.
- **AHA-lesevisning merget 18.11.2026:** [AHA PR #1061](https://github.com/Paradispartiet/AHA-EchoNet/pull/1061) er merget med 7/7 grønne GitHub-arbeidsflyter. `databaser.html` i AHA viser den maskinlesbare metadataoversikten direkte fra dette registeret via GitHub, med søk og skille mellom dokumentert og uavklart status. Dette er ikke en bekreftet Cloudflare-preview-deploy og ikke live databasestatus.
- **Ikke verifisert:** Synk til en hostet ParadisDB-database og automatiske leverandørkontroller. Ingen D1-instans er godkjent som felles register.
- **Sikkerhet:** Ingen passord, API-nøkler, tilkoblingsstrenger eller private brukerdata; offentlige Fysen-D1 må ikke gjenbrukes som privat registreringstjeneste.
