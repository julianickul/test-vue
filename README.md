# pharmacy

Тестовое задание для vue

Самостоятельное приложение «Аптека» на Vue 3, Vue Router и Element Plus.
Сборка и локальный запуск используют Vue CLI и Webpack.

## Локальные команды

- `npm run serve` — запуск на порту `4036`.
- `npm run build` — production-сборка в `dist`.
- `npm run lint` — проверка и исправление ESLint.

## Mock API

Кандидат использует готовый `mockedFetch` вместо глобального `fetch`:

```js
import mockedFetch from '@/backend';

const response = await mockedFetch('/api/medicines');

if (!response.ok) {
  const { error } = await response.json();
  throw new Error(error.message);
}

const { items } = await response.json();
```

задержка ответа — 300 мс.

Для POST, PATCH и DELETE передавайте `body: JSON.stringify(data)`
и `headers: { 'Content-Type': 'application/json' }`.

Данные хранятся в `localStorage` под ключом `pharmacy.medicines`.
GET при отсутствии ключа, нечитаемом JSON или значении, которое не является массивом,
сохраняет и возвращает 10 учебных записей
из `src/backend/MedicinesData.js`. Производители и сведения в примерах условные.
Любой сохранённый массив, включая пустой, не заполняется заново.
В GET-ответ попадают только объекты со строковыми `id` и `tradeName`;
остальные элементы пропускаются без изменения хранилища. Для сброса каталога удалите
этот ключ в DevTools и повторите GET. Новые `id` и даты назначает mock API.

Валидация полей выполняется на фронтенде.

Для воспроизведения ошибки списка или сохранения добавьте к нужному вызову
заголовок `'X-Mock-Error': 'true'`. Он вернёт `500` с объектом
`{ "error": { "code": "INTERNAL_ERROR", "message": "..." } }`,
не меняя хранилище. Уберите заголовок для успешного повторного запроса.
Ошибки доступа к `localStorage` также возвращают `500` в этом формате.
Отсутствующая запись возвращает `404`, неизвестный маршрут — `404`,
неподдерживаемый метод — `405`, нечитаемое JSON-тело — `400`.
