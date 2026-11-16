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
| **DB-01** | Fysen – original | Supabase PostgreSQL 17 / produksjonshistorikk | `fysen`, ref `voglczxxtbwcxjrbffbt` | `eu-west-1`; org **Aha EchoNet**, ID `conidfhuuaueyoxwklae` | **Kontrollert:** `ACTIVE_HEALTHY` rapportert av prosjekt-API; SQL lesbar; 1 590 MB; `transaction_read_only=off`. Historisk over Free-kvoten og 11.11 merket «Unhealthy / Services restricted». Ikke verifisert med produksjonsskriving. | Kontroller faktisk organisasjonskvote, apptilkobling og om den kan brukes sikkert til writes; ingen sletting. |
| **DB-02** | Fysen – recovery | Supabase PostgreSQL 17 / gjenopprettingsprosjekt | `fysen-recovery-free`, ref `txaopscyxjvvmwawsphk` | `eu-west-1`; samme org som DB-01 | **Kontrollert:** `ACTIVE_HEALTHY` fra prosjekt-API; SQL lesbar; 60 MB; `transaction_read_only=off`. Historisk begrensning i organisasjonen; **ikke** erklært komplett live-produksjon. | Verifiser datadekning, avhengigheter og kvote før eventuell omkobling. |
| **DB-03** | AHA – eldre MVP / Auth | Supabase PostgreSQL + Auth | `AHA`, ref `wshmybqyksrwkawqleiz` | Org **EchoNet**, tidligere dokumentert ID `kepuwrsiqhqwfgijzpev`; annen kontotilgang | **Dokumentert, live-status uavklart:** AHA frontend peker hit. Tidligere pausevarsel. Prosjektet er ikke tilgjengelig fra nåværende tilkoblede Supabase-identitet. | Logg inn med riktig Supabase-identitet og kontroller status, kvote, tabeller og Auth uten endringer. |
| **DB-04** | AHA – staging | Supabase PostgreSQL / test | `AHA Staging`, ref `sstuzwppsheivczyqrim` | Org **EchoNet** | **Dokumentert, live-status uavklart:** brukt for isolerte canonical-migrasjons- og TLS-/rolleprøver; tidligere pausevarsel. | Verifiser eksisterende tilstand og sikkerhet; må ikke forveksles med produksjon. |
| **DB-05** | AHA – canonical production | Azure Database for PostgreSQL Flexible Server **16**, database `aha` | Privat Azure production, eksakt server-ID/hostname ikke registrert offentlig | Azure **North Europe**, privat VNet / DNS; ressursgruppe og driftssecrets i beskyttet Azure/GitHub-infrastruktur | **Dokumentert:** deployet. Canonical manuell production-pilot aktiv for **nøyaktig to verifiserte profiler**. Automatisk/login-/bakgrunnssynk er **av**. Ikke en generell produksjonslansering. | Kontroller stabilitet, backup/PITR og drift før større pilot eller endring av databaseplattform. |
| **DB-06** | Fysen – ny Cloudflare-database | Cloudflare Workers **D1** | D1-ID `8b6616b4-11df-4ddc-9817-378f51ee0b69`; **visningsnavn ikke verifisert** | Cloudflare-konto `097bca85df0240062216f5d74efc0b30` | **Brukerbekreftet 16.11:** oppsettet «virker». Ingen live D1-spørring, skjemakontroll, volumkontroll eller bevist datamigrering er gjennomført her. | Finn databasens visningsnavn; dokumenter tabeller, rader, bindinger, migrasjoner og faktisk Fysen-lesing/skriving. |

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

**Tolkning:** Disse lesebaserte kontrollene viser at serverne svarer og at den inspiserte SQL-sesjonen ikke er read-only. De beviser **ikke** at Fysens produksjonsapplikasjon har fungerende skrivetilgang, at API-ene er friske eller at organisasjonens Free-forbruksgrenser er opphevet. Dashboard-observasjonen fra 11.11 viste organisasjonsforbruk på **1 682 / 500 MB**, med `Services restricted`. Gjeldende kvotestatus må kontrolleres separat.

**Sikkerhetsvarsel:** Supabase-verktøyet flagget `public.spatial_ref_sys` med RLS deaktivert i begge Fysen-prosjekter. Dette er en PostGIS-relatert tabell. Undersøk faktisk eksponering, rettigheter og nødvendige policyer før eventuelle endringer; **ikke** aktiver RLS blindt eller kjør automatisk SQL-retting.

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

**ParadisDB** er foreløpig navnet på arbeidet med en samlet databaseplattform/oversikt. Det finnes **ikke nok bekreftelse til å registrere en egen sjuende databaseinstans** under dette navnet. Før den føres opp, må vi avklare om ParadisDB er et faktisk opprettet D1-databasenavn, en Cloudflare Worker-løsning eller et planlagt felles lag. DB-06 er én identifisert Cloudflare D1-instans og må ikke telles dobbelt.

| Forslag | Status | Krav før «fullført» |
|---|---|---|
| Flytte Fysen fra Supabase DB-01/02 til Cloudflare D1 DB-06 | **Ikke bevist utført** | Tabell-/datamapping, datatellinger, integritet, appens read/write-test, deploykobling, rollback og beholdt historisk backup. |
| Frigjøre plass eller avslutte Fysen Supabase | **Ikke godkjent** | Bekreftet ny produksjonsplattform, fullstendig eksport/gjenoppretting, avhengighetskart og eksplisitt beslutning. Ingen destruktiv opprydding automatisk. |
| Flytte AHA legacy DB-03/04 | **Til vurdering** | Innlogging/roller, brukerdata, samtykke, synkronisering, storage og sikkerhet må kartlegges på riktig konto. |
| Flytte AHA canonical Azure DB-05 | **Ingen beslutning** | Produksjonspiloten og privat PostgreSQL må ikke forveksles med legacy Supabase. Bevar isolasjon, migrasjoner, RLS/roller, PITR og manuell synk-policy. |
| Flytte statiske JSON-kataloger | **Ikke besluttet** | Ikke flytt data bare fordi det finnes D1; dokumenter faktiske behov og appavhengigheter. |

**Fastsatt kostnadsgrense for Fysen:** Ingen nye abonnementskostnader uten ny eksplisitt beslutning; ikke oppgrader Supabase, deaktiver Spend Cap eller slett historikk som en følge av dette registeret.

## 5. Neste kontroller – i prioritert rekkefølge

1. **Cloudflare:** Les DB-06 direkte; registrer eksakt navn, tabeller, datamengde, Worker-bindinger, API-er og reell driftstilkobling. Avklar om `paradisDB` er samme database eller en annen instans.
2. **AHA Supabase:** Bytt til riktig innlogging/organisasjon; bekreft DB-03 og DB-04, størrelser, fakturakvote, pause-/helsetilstand, Auth, RLS og eksportmuligheter.
3. **Fysen:** Kontroller nåværende organisasjonskvote og faktisk appskriving på DB-01/02 uten å røre produksjonsinnhold; kartlegg full avhengighetsliste før mulig migrasjon.
4. **AHA Azure:** Sjekk gjeldende pilot-health, backup/PITR-retention, lagringsbruk og databasebelastning, uten å utvide piloten.
5. **History GO og øvrige apper:** Verifiser backend-miljøer og faktisk datalagring. Registrer nye hostede instanser med egne ID-er **bare** når de er bekreftet.

## 6. Endringsrutine for registeret

Ved **hver** opprettelse, flytting, deaktivering, kvotehendelse eller restore-test skal den eksisterende raden oppdateres i **denne filen**. Minstekrav per post: system, miljø (prod/staging/recovery), leverandør, prosjektref, konto/org, region, hovedinnhold, live status, kapasitet, backup, siste kontroll, dokumentasjonslenke, avhengigheter og neste tiltak. Merk fakta som `kontrollert`, `dokumentert` eller `uavklart`, med dato. En flytting er først «fullført» når dataintegritet, apptilkobling og rollback er verifisert og den tidligere instansen eksplisitt er beholdt eller avviklet etter beslutning.

### Kilder / sporing

- [Fysen – eksisterende Supabase-prosjektregister (11.11)](https://github.com/Paradispartiet/fysen/blob/main/docs/supabase-project-inventory.md)
- [Fysen – historikk og read-only-hendelse (02.11)](https://github.com/Paradispartiet/fysen/blob/main/docs/fysen-storage-readonly-recovery-2026-11-02.md)
- [Fysen – gratisdrift og staging-test (12.11)](https://github.com/Paradispartiet/fysen/blob/main/docs/fysen-zero-cost-operating-plan-2026-11-12.md)
- [AHA – Supabase og canonical databaselag](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/supabase/README.md)
- [AHA – Azure production](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/docs/AHA_AZURE_PRODUCTION_PLATFORM_V1.md)
- [AHA – gjeldende canonical production pilot](https://github.com/Paradispartiet/AHA-EchoNet/blob/main/docs/AHA_CANONICAL_PRODUCTION_PILOT_STATUS.md)
- [History GO – backend/lagring](https://github.com/Paradispartiet/History-Go/blob/main/backend/README.md)

**Begrensning ved denne oppdateringen:** Supabase DB-01/02 ble kontrollert direkte 16.11.2026. Andre providerinstanser ble ikke lest direkte denne dagen. Historiske dashboardobservasjoner er datert og må ikke fremstilles som live-status. Ingen data, databasekonfigurasjon, brukere eller eksisterende instanser ble endret for å utarbeide registeret.
