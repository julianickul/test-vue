import { generateUUID } from './GenerateUtil';
import { initialMedicines } from './MedicinesData.js';

export const MEDICINES_STORAGE_KEY = `pharmacy.medicines`;

const editableFields = [
  `tradeName`,
  `dosageForm`,
  `dosage`,
  `packageQuantity`,
  `packageUnit`,
  `manufacturer`,
  `country`,
  `registrationNumber`,
  `prescriptionRequired`,
  `notes`,
];

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': `application/json`, ...headers },
  });
}

function errorResponse(code, message, status, headers = {}) {
  return jsonResponse({ error: { code, message } }, status, headers);
}

function saveMedicines(medicines) {
  window.localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(medicines));
}

function readMedicines(initialize = false) {
  const stored = window.localStorage.getItem(MEDICINES_STORAGE_KEY);

  if (stored !== null) {
    let medicines;

    try {
      medicines = JSON.parse(stored);
    } catch {
      medicines = null;
    }

    if (Array.isArray(medicines)) {
      return medicines;
    }

    if (!initialize) {
      throw new TypeError(`Некорректные данные каталога в localStorage`);
    }
  }

  if (!initialize) {
    return [];
  }

  const now = new Date().toISOString();
  const medicines = initialMedicines.map((medicine) => ({
    ...medicine,
    id: generateUUID(),
    createdAt: now,
    updatedAt: now,
  }));

  saveMedicines(medicines);
  return medicines;
}

function pickEditableFields(payload) {
  return Object.fromEntries(
    editableFields
      .filter((field) => Object.hasOwn(payload, field))
      .map((field) => [field, payload[field]])
  );
}

function waitForResponse() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

export default async function mockedFetch(input, init) {
  const resource = input instanceof Request ? input : new URL(input, window.location.href);
  const request = new Request(resource, init);

  await waitForResponse();

  const { pathname } = new URL(request.url);
  const route = pathname.match(/^\/api\/medicines(?:\/([^/]+))?\/?$/);

  if (!route) {
    return errorResponse(`ROUTE_NOT_FOUND`, `Маршрут не найден`, 404);
  }

  const id = route[1];
  const allowedMethods = id ? [`PATCH`, `DELETE`] : [`GET`, `POST`];

  if (!allowedMethods.includes(request.method)) {
    return errorResponse(`METHOD_NOT_ALLOWED`, `Метод не поддерживается`, 405, {
      Allow: allowedMethods.join(`, `),
    });
  }

  if (request.headers.get(`X-Mock-Error`) === `true`) {
    return errorResponse(
      `INTERNAL_ERROR`,
      `Искусственная ошибка mock API. Попробуйте ещё раз.`,
      500
    );
  }

  let payload;

  if (request.method !== `GET`) {
    try {
      payload = await request.json();
    } catch {
      return errorResponse(`BAD_REQUEST`, `Не удалось прочитать JSON запроса`, 400);
    }
  }

  try {
    const medicines = readMedicines(request.method === `GET`);

    if (request.method === `GET`) {
      const items = medicines.filter(
        (medicine) =>
          medicine !== null &&
          typeof medicine === `object` &&
          !Array.isArray(medicine) &&
          typeof medicine.id === `string` &&
          typeof medicine.tradeName === `string`
      );

      return jsonResponse({ items });
    }

    if (request.method === `POST`) {
      const now = new Date().toISOString();
      const medicine = {
        registrationNumber: null,
        notes: null,
        ...pickEditableFields(payload),
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
      };

      medicines.push(medicine);
      saveMedicines(medicines);
      return jsonResponse(medicine, 201);
    }

    const index = medicines.findIndex((medicine) => medicine.id === id);

    if (index === -1) {
      return errorResponse(`MEDICINE_NOT_FOUND`, `Препарат не найден`, 404);
    }

    if (request.method === `PATCH`) {
      const medicine = {
        ...medicines[index],
        ...pickEditableFields(payload),
        updatedAt: new Date().toISOString(),
      };

      medicines[index] = medicine;
      saveMedicines(medicines);
      return jsonResponse(medicine);
    }

    medicines.splice(index, 1);
    saveMedicines(medicines);
    return new Response(null, { status: 204 });
  } catch {
    return errorResponse(
      `INTERNAL_ERROR`,
      `Не удалось прочитать или сохранить данные в localStorage`,
      500
    );
  }
}
