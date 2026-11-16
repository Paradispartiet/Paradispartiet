# Paradispartiet – felles databaseregister

**Oppdatert:** 16. november 2026  
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
| **DB-03** | AHA – eldre MVP / Auth | Supabase PostgreSQL + Auth | `AHA`, ref `wshmybqyksrwkawqleiz` | Org **EchoNet**, tidligere dokumentert ID `kepuwrsiqhqwfgijzpev`; separat fra Fysen-kontoen | **Dashboard-observasjon 16.11:** AHA-prosjektet vises uten «paused»-merke. Organisasjonen **EchoNet** bruker **39 / 500 MB totalt** (ikke bevist individuell DB-størrelse), og har 3 månedlig aktive brukere. Frontend peker til denne prosjektrefen. Direkte SQL/API-kontroll fra tilkoblet Fysen-konto er ikke mulig. | Kontroller individuell prosjektstatus, Auth, RLS og datatilgang fra riktig konto; ingen migrering nødvendig kun av hensyn til Fysens kvote. |
| **DB-04** | AHA – staging | Supabase PostgreSQL / test | `AHA Staging`, ref `sstuzwppsheivczyqrim` | Org **EchoNet** | **Dashboard-observasjon 16.11: «Project is paused».** Tidligere brukt til isolerte canonical-, TLS- og rolleprøver; ikke produksjonsmiljø. | Ikke anta at staging-API fungerer. Vurder om testmiljøet skal reaktiveres før nye staging-avhengige tester, uten å påvirke produksjon. |
| **DB-05** | AHA – canonical production | Azure Database for PostgreSQL Flexible Server **16**, database `aha` | Privat Azure production, eksakt server-ID/hostname ikke registrert offentlig | Azure **North Europe**, privat VNet / DNS; ressursgruppe og driftssecrets i beskyttet Azure/GitHub-infrastruktur | **Dokumentert:** deployet. Canonical manuell production-pilot aktiv for **nøyaktig to verifiserte profiler**. Automatisk/login-/bakgrunnssynk er **av**. Ikke en generell produksjonslansering. | Kontroller stabilitet, backup/PITR og drift før større pilot eller endring av databaseplattform. |
| **DB-06** | Fysen – ny Cloudflare-database (kandidat) | Cloudflare Workers **D1** | D1-ID `8b6616b4-11df-4ddc-9817-378f51ee0b69`; **visningsnavn ikke verifisert** | Cloudflare-konto `097bca85df0240062216f5d74efc0b30` | **Oppgitt av bruker, ikke live-kontrollert:** D1-database er opprettet/planlagt til Fysen. Cloudflare Pages-test av **AHA Insta** er bekreftet av bruker, men dette er **ikke bevis på D1-datalagring eller Fysen-migrering**. Ingen D1-spørring, skjemakontroll eller radtelling verifisert. | Kontroller navn, datainnhold, Worker-bindinger, tilgang, backup og faktiske Fysen-API-kall før eventuell omkobling. |

**Direkte lenker**

- [DB-01 · Supabase Fysen](https://supabase.com/dashboard/project/voglczxxtbwcxjrbffbt)
- [DB-02 · Supabase Fysen recovery](https://supabase.com/dashboard/project/txaopscyxjvvmwawsphk)
- [DB-03 · Supabase AHA](https://supabase.com/dashboard/project/wshmybqyksrwkawqleiz)
- [DB-04 · Supabase AHA Staging](https://supabase.com/dashboard/project/sstuzwppsheivczyqrim)
- [DB-05 · AHA Azure-infrastruktur og operativ status](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/docs/AHA_AZURE_PRODUCTION_PLATFORM_V1.md)
- [DB-06 · Cloudflare D1 Settings](https://dash.cloudflare.com/097bca85df0240062216f5d74efc0b30/workers/d1/databases/8b6616b4-11df-4ddc-9817-378f51ee0b69/settings)

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
- Disse organisasjonene er **adskilte**. Fysens kvoteproblem er **ikke i seg selv bevis** for at AHA er kvotebegrenset. AHA sin funksjonelle tilkobling til Supabase/Auth og Azure canonical må fortsatt prøves separat.

**AHA Cloudflare Pages, brukerprøve:** Feed-innlegg og bildevalg for Insta fungerer i lokal nettleserlagring på Cloudflare-preview; [PR #1039](https://github.com/Paradispartiet/AHA-EchoNet/pull/1039) ble merget med grønne tester. Dette bekrefter **ikke** databasepersistens, Auth over riktig origin eller AI-backend. Eksisterende AHA Supabase og Azure er fortsatt egne datakilder; ingen flytting er utført.

## 2. Lokale og filbaserte datalagre – ikke egne hostede databaser

| System | Lagring og kodeplassering | Status / avgrensning |
|---|---|---|
| **Fysen, offentlig gratisindeks** | GitHub-generert `fysen-free-public-index`; kilder i [fysen-repo](https://github.com/Paradispartiet/fysen), offentlig arkiv-API hos Vercel | Dokumentert i drift 12.11 med ca. 973 restauranter og 47 265 menyposter. Et verifisert, begrenset **arkiv**, ikke sanntids-PostgreSQL eller full historikk. |
| **AHA local-first** | Nettleserens `localStorage` samt valgfritt `public.aha_*` på DB-03. Canonical `aha.*` for produksjon ligger på **DB-05**, ikke i DB-03/04. | Kode/verifisert arkitektur. Hver modul må vurderes for seg; lokal lagring er ikke sikkerhetskopi av Azure eller Supabase. |
| **History GO** | [History-Go/data](https://github.com/Paradispartiet/History-Go/tree/main/data), manifest-/JSON-data for steder, quiz, kunnskap m.m. | GitHub-data er ikke egen databaseinstans. FastAPI/Social Meet har PostgreSQL/Supabase-kontrakter under `backend/` og `supabase/`; **faktisk live database-/deploytilkobling er ikke verifisert** i dette registeret. Ikke opprett en oppdiktet separat DB-ref. |
| **Civication** | Del av [History-Go](https://github.com/Paradispartiet/History-Go), bl.a. `data/Civication` | Samme repo som History GO; ingen separat hostet produksjonsdatabase identifisert. |
| **HG Film Producer** | [HG_Film_Producer/data](https://github.com/Paradispartiet/HG_Film_Producer/tree/main/data) og klientlagring der appen bruker dette | Fil-/appdata identifisert. Ingen separat hostet database bekreftet. |
| **Football Manager** | [HistoryGo-FootballManager/data](https://github.com/Paradispartiet/HistoryGo-FootballManager/tree/main/data), appens lokale karriere-/spilltilstand | GitHub-filer identifisert. Eventuell persistent backend/database må undersøkes; ingen separat hostet instans er bekreftet. |
| **Paradisavisa** | [Paradisavisa](https://github.com/Paradispartiet/Paradisavisa) – bl.a. `notiser.json`, `posts.json`, artikler og redaksjonelle JSON-filer | Publisert filbasert innhold, **ikke** en bekreftet ekstern SQL-database. |
| **Paradisradioen** | Samme [Paradisavisa-repo](https://github.com/Paradispartiet/Paradisavisa), nyhetsliste og radiofiler | Ingen separat database bekreftet. Radio/lydfiler er ikke selv en relasjonsdatabase. |
| **EchoNet** | [EchoNet-repo](https://github.com/Paradispartiet/EchoNet) | Eget repo, men ikke grunnlag for å føre opp enda en hostet database. |

## 3. Backuper, historikk og gjenoppretting

| Registerpost | Sted / bevis | Hva er bevart | Begrensning / kontroll |
|---|---|---|---|
| **BK-01 Fysen historikk 02.11** | **Privat Google Drive**, fire ZIP-deler; [gjenopprettingsrapport](https://github.com/Paradispartiet/fysen/blob/main/docs/fysen-storage-readonly-recovery-2026-11-02.md) | Verifisert dump av **seks** meny-/historikktabeller. Isolert PostgreSQL 17 + PostGIS-restore fullført med korrekte radtall. | **Ikke** komplett Supabase-prosjekt, alle app-tabeller, Auth eller storage-objekter. Ikke slett original ut fra denne alene. |
| **BK-02 Fysen kompakt prøvedatabase 12.11** | [Gratisdrift og isolert test](https://github.com/Paradispartiet/fysen/blob/main/docs/fysen-zero-cost-operating-plan-2026-11-12.md) | Midlertidig isolert Postgres-test på ca. **163,2 MB** etter komprimering. | Test, ikke migrert produksjon. Eldre søkeresultatkoblinger krever særlig bevaring. |
| **BK-03 AHA Azure canonical** | [Azure-operativ dokumentasjon](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/docs/AHA_AZURE_PRODUCTION_PLATFORM_V1.md) | Dokumentert vellykket **PITR restore-rehearsal** til separat privat PostgreSQL-server. | Nåværende backupstatus/retention skal kontrolleres i Azure; ikke likestill med en lokal eksport. |
| **BK-04 AHA Supabase DB-03/04** | Riktig Supabase-konto/organisasjon | **Uavklart** i denne kontrollen. | Kontroller backup/eksport, plan, pause og størrelse. |
| **BK-05 Cloudflare D1 DB-06** | Cloudflare-dashboard | **Uavklart**. | Kontroller schema-export og backup-/restore-metode før produksjonsflytting. |

## 4. ParadisDB og foreslåtte flyttinger

**ParadisDB** er navnet på arbeidet med en samlet databaseplattform/oversikt, **ikke** automatisk en ekstra hostet database. [Fysen PR #1204 – ParadisDB v0](https://github.com/Paradispartiet/fysen/pull/1204) er kontrollert **åpen draft 16.11**: dokumenterer lokal SQLite-/D1-/Worker-pilot mot offentlig katalog, men **ikke godkjent remote Cloudflare-produksjonsdeploy, fullstendig historikkmigrering eller aktiv Fysen-backend-omkobling**. En lokal D1-kompatibel test er ikke det samme som at DB-06 er fylt. DB-06 skal ikke telles dobbelt.

| Forslag | Status | Krav før «fullført» |
|---|---|---|
| Flytte Fysen fra Supabase DB-01/02 til Cloudflare D1 DB-06 | **Ikke bevist utført** | Tabell-/datamapping, datatellinger, integritet, appens read/write-test, deploykobling, rollback og beholdt historisk backup. |
| Frigjøre plass eller avslutte Fysen Supabase | **Ikke godkjent** | Bekreftet ny produksjonsplattform, fullstendig eksport/gjenoppretting, avhengighetskart og eksplisitt beslutning. Ingen destruktiv opprydding automatisk. |
| Flytte AHA legacy DB-03/04 | **Ikke prioritert – behold mens appen ferdigstilles** | EchoNet-organisasjonen har bare 39 / 500 MB samlet forbruk og er separat fra Fysens sperrede organisasjon. Kontroller først innlogging/roller, brukerdata, sync og API fra riktig konto; migrering er ikke nødvendig av hensyn til Fysen. |
| Flytte AHA canonical Azure DB-05 | **Ingen beslutning** | Produksjonspiloten og privat PostgreSQL må ikke forveksles med legacy Supabase. Bevar isolasjon, migrasjoner, RLS/roller, PITR og manuell synk-policy. |
| Flytte statiske JSON-kataloger | **Ikke besluttet** | Ikke flytt data bare fordi det finnes D1; dokumenter faktiske behov og appavhengigheter. |

**Fastsatt kostnadsgrense for Fysen:** Ingen nye abonnementskostnader uten ny eksplisitt beslutning; ikke oppgrader Supabase, deaktiver Spend Cap eller slett historikk som en følge av dette registeret.

## 5. Neste kontroller – i prioritert rekkefølge

1. **Cloudflare:** Les DB-06 direkte; registrer eksakt navn, tabeller, datamengde, Worker-bindinger, API-er og reell driftstilkobling. Avklar om `paradisDB` er samme database eller en annen instans.
2. **AHA Supabase:** Skjermbilder fra riktig **EchoNet**-organisasjon er kontrollert: 39 / 500 MB totalt, AHA synlig uten pauseindikator, **AHA Staging pauset**. Bekreft DB-03/04 individuelt, Auth, RLS, tabeller, eksport og funksjonstest. Ikke flytt AHA bare fordi Fysens organisasjon har overskredet kvoten.
3. **Fysen:** Kontroller nåværende organisasjonskvote og faktisk appskriving på DB-01/02 uten å røre produksjonsinnhold; kartlegg full avhengighetsliste før mulig migrasjon.
4. **AHA Azure:** Sjekk gjeldende pilot-health, backup/PITR-retention, lagringsbruk og databasebelastning, uten å utvide piloten.
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

**Begrensning ved denne oppdateringen:** Supabase DB-01/02 ble kontrollert direkte med lesebaserte SQL-spørringer 16.11.2026; detaljerte radtall og tabellstørrelser over er fra denne kontrollen. Organisasjonskvoter og AHA-/staging-pauser er **skjermbildeobservasjoner fra bruker 16.11**, ikke direkte tilgang til AHA-kontoen. Andre providerinstanser, særlig Cloudflare D1 og AHA Azure, ble **ikke** lest live i denne oppdateringen. Ingen databaser, API-tilkoblinger, brukere, produksjonspekere, datainnhold eller betalingsoppsett er endret.
