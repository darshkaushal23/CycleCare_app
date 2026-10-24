/** Public pages only. Titles match the destination; no invented statistics. */
export const SOURCES = {
  nhsPeriods: {
    name: "NHS",
    title: "Periods",
    url: "https://www.nhs.uk/conditions/periods/",
  },
  nhsHeavy: {
    name: "NHS",
    title: "Heavy periods",
    url: "https://www.nhs.uk/conditions/heavy-periods/",
  },
  nhsIrregular: {
    name: "NHS",
    title: "Irregular periods",
    url: "https://www.nhs.uk/conditions/irregular-periods/",
  },
  nhsPain: {
    name: "NHS",
    title: "Period pain",
    url: "https://www.nhs.uk/conditions/period-pain/",
  },
  nhsMissed: {
    name: "NHS",
    title: "Stopped or missed periods",
    url: "https://www.nhs.uk/conditions/stopped-or-missed-periods/",
  },
  nhsPcos: {
    name: "NHS",
    title: "Polycystic ovary syndrome (PCOS)",
    url: "https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/",
  },
  acogBleeding: {
    name: "ACOG",
    title: "Abnormal uterine bleeding",
    url: "https://www.acog.org/womens-health/faqs/abnormal-uterine-bleeding",
  },
  acogPain: {
    name: "ACOG",
    title: "Dysmenorrhea: painful periods",
    url: "https://www.acog.org/womens-health/faqs/dysmenorrhea-painful-periods",
  },
  acogAdolescents: {
    name: "ACOG",
    title: "Your first period (menarche)",
    url: "https://www.acog.org/womens-health/faqs/your-first-period-menarche",
  },
  whoMenstrual: {
    name: "WHO",
    title: "Menstrual health fact sheet",
    url: "https://www.who.int/news-room/fact-sheets/detail/menstrual-health",
  },
  cdcHeavy: {
    name: "CDC",
    title: "About heavy menstrual bleeding",
    url: "https://www.cdc.gov/female-reproductive-health/about/about-heavy-menstrual-bleeding.html",
  },
  nhmHygiene: {
    name: "MoHFW / NHM",
    title: "Menstrual hygiene scheme",
    url: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=1021&lid=391",
  },
  fogsi: {
    name: "FOGSI",
    title: "Federation of Obstetric and Gynaecological Societies of India",
    url: "https://www.fogsi.org/",
  },
};

export function sourceList(ids) {
  return ids.map((id) => SOURCES[id]).filter(Boolean);
}
