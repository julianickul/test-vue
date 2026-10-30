export const COUNTRY_OPTIONS = [
  { value: `RU`, label: `Россия` },
  { value: `BY`, label: `Беларусь` },
  { value: `IN`, label: `Индия` },
  { value: `DE`, label: `Германия` },
  { value: `FR`, label: `Франция` },
  { value: `CH`, label: `Швейцария` },
];

export const DOSAGE_FORM_OPTIONS = [
  { value: `tablet`, label: `Таблетки` },
  { value: `capsule`, label: `Капсулы` },
  { value: `solution`, label: `Раствор` },
  { value: `suspension`, label: `Суспензия` },
  { value: `powder`, label: `Порошок` },
  { value: `ointment`, label: `Мазь` },
  { value: `cream`, label: `Крем` },
  { value: `drops`, label: `Капли` },
];

export const PACKAGE_UNIT_OPTIONS = [
  { value: `tablet`, label: `Таблетка` },
  { value: `capsule`, label: `Капсула` },
  { value: `ampoule`, label: `Ампула` },
  { value: `vial`, label: `Флакон` },
  { value: `sachet`, label: `Пакетик` },
];

export const EDITABLE_MED_FORM_FIELDS = [
  `tradeName`,
  `dosageForm`,
  `dosage`,
  `packageQuantity`,
  `packageUnit`,
  `manufacturer`,
  `country`,
  `prescriptionRequired`,
  `registrationNumber`,
  `notes`
];
