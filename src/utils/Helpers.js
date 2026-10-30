export const trimValue = (value) => (typeof value === `string` ? value.trim() : value);

export const normalizeForm = (item) => ({
  tradeName: trimValue(item.tradeName),
  dosageForm: trimValue(item.dosageForm),
  dosage: trimValue(item.dosage),
  packageQuantity: Number(item.packageQuantity),
  packageUnit: trimValue(item.packageUnit),
  manufacturer: trimValue(item.manufacturer),
  country: trimValue(item.country),
  registrationNumber: trimValue(item.registrationNumber) || null,
  prescriptionRequired: Boolean(item.prescriptionRequired),
  notes: trimValue(item.notes) || null,
});

export const getLabelByValue = (options, value) => {
  const option = options.find((item) => item.value === value);
  return option ? option.label : value;
};

export const parseResponseJson = async (response) => {
  const rawText = await response.text();
  if (!rawText) {
    return null;
  }
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
};

export const hasFormChanges = (original, current, fields) => {
  if (!original || !current || !Array.isArray(fields)) {
    return true;
  }

  return fields.some((field) => {
    const originalValue = original[field] ?? null;
    const currentValue = current[field] ?? null;
    return originalValue !== currentValue;
  });
};
