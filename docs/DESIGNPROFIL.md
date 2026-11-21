# Paradispartiet – felles designprofil

**Referanse fra 21. november 2026.** Denne profilen er utgangspunktet for nye sider og målrettet feilretting. Hovedsidene er ferdig oppgradert; det skal ikke startes en ny generell designrunde uten en ny, uttrykkelig bestilling.

## Autoritative kilder
- `assets/logo.svg`: gjeldende P-symbol. Ikke tegn en ny P eller innfør alternativ logo.
- `styles.css`: farger, typografi, knapper, navigasjon, bredder og responsive regler. Gjenbruk eksisterende mønstre i stedet for parallelle stilsett.
- `script.js`: felles navigasjon, søk i dokumenter og prosjektoversikt, lesefremdrift og tilbake-til-toppen-funksjoner.
- `docs/ILLUSTRASJONSPLAN.json`: hvilke illustrasjoner som har godkjent sted, motiv, alt-tekst og visningsstatus.

## Visuell profil
- **Mørk base**: svart `#000000`, nattblå `#030b13`, dypblå `#092845`; lys tekst `#f4faff`.
- **Farger med funksjon**: solgult `#ffe449` og `#ffdc3e` til vektlegging og tydelige handlinger; turkis `#4ce2eb` til fokus, lenker og detaljer. Blått, oransje og grønt brukes moderat, ikke som ekstra pynt.
- **Tekst først**: store, lesbare overskrifter, begrenset linjelengde, tydelige seksjonsskiller, god kontrast og luft. Kortfattede prosjektkort fremfor store dekorative bilder.
- **Samme navigasjon** på alle hovedsider: Hjem, Politikk, Manifest, Grunnlag, Prosjekter, Om, Kontakt og den tydelige lenken «Bli med». Gjenbruk den tilgjengelige mobilmenyen.
- **Mobil/iPad**: ved smale bredder skal overskrifter brytes pent, kort bli én kolonne, knapper være lette å trykke og siden ikke få horisontal rulling. Bruk eksisterende knekkpunkter (`1040px` og `700px`) der de passer.
- **Lange tekster**: viderefør søkbar/sammenleggbar innholdsoversikt, lesefremdrift og «Til toppen» der dette allerede finnes.

## Illustrasjoner
- Bilder skal forklare teksten der de står, ikke bare fylle en flate.
- **Ett motiv brukes bare én gang på nettstedet.** Ikke resirkuler et illustrasjonsbilde som hovedbilde, prosjektkortbilde eller mellomkapittelbilde på en annen side.
- Behold nåværende stramme bildeutvalg. Nye motiver krever et konkret tekststed, separat motivbeskrivelse, korrekt alt-tekst og oppdatering av illustrasjonsplanen før de vises.
- Arbeidsrekkefølge: **ferdig tekst → eget bilde/asset → ferdig kort eller side**.

## Brukerreisen
Besøkende skal finne Politikk, forstå Paradismodellen gjennom Manifest/Grunnlag/Økonomisk modell, utforske Prosjekter og komme til medlemskap fra forsiden. Medlemslenken går til `kontakt.html#meld-deg-inn`, og skjemaet er en ekstern tjeneste. Medlemskap og papirbasert støtteerklæring skal fremstå som to ulike handlinger.

## Videre vedlikehold
1. Rett **bare dokumenterte feil**, utilgjengelige handlinger eller brudd i brukerreisen.
2. Bevar vedtatt innhold, fungerende lenker, P-logo og farger.
3. Kjør den korte nettsteds- og lenkekontrollen ved endringer; nettleser-/regresjonskontroll bare ved faktisk behov.
4. Prioriter deretter innhold, konkrete forklaringer og prosjektfunksjoner fremfor flere dekorative endringer.

**Merk:** Denne filen fastsetter designprofilen, men erstatter ikke en faktisk visuell gjennomgang i mobil- og iPad-nettleser ved behov.
