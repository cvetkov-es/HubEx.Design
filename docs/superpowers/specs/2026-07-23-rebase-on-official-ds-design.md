# Спецификация: перебаза дизайн-системы с Figma на `@hubex/design-system`

Дата: 2026-07-23. Ветка работ: `feat/rebase-on-official-ds`.
Предыстория: разведка `docs/design-source/2026-07-23-official-ds-recon.md`,
реестр блокеров `docs/design-source/2026-07-23-official-ds-reuse-blockers.md`.

## Цель

Сменить **источник истины** дизайн-системы `@cvetkov_es/{tokens,css,react}` с
ручного декода Figma-файлов на официальный пакет продуктовой команды
`@hubex/design-system` (публичный npm). Это:
- убирает класс багов «выдуманных значений» (история 0.1.0);
- добавляет реальные шкалы, которых не было (spacing, sizes, typography, shadows);
- делает обновление повторяемым (скрипт вместо ручного декода `.fig`);
- выравнивает API компонентов с реальным продуктом (важно для ИИ-генерации плагинов).

Пакет **нельзя тянуть в плагины как зависимость** (styled-components-рантайм,
react@18 pinned, 9.26 МБ, отключённый tree-shaking — см. реестр блокеров), поэтому
`@cvetkov_es/*` остаётся лёгким переизложением (CSS-классы `.hx-*` + тонкий React,
`sideEffects:false`), но теперь по официальным значениям и API.

## Источник и объём

- **Источник:** пакет `@hubex/design-system`, **закреплённая версия `0.4.0`** (latest).
  Приложение живёт на `0.2.0`, но источником берём новейший официальный релиз.
  Версия жёстко фиксируется в экстракторе и в документации.
- **Бренд:** только ветка `themes.HubEx` (пакет мульти-брендовый —
  `HubEx / MyQRcards / CardEx` расходятся значениями; берём HubEx).
- **Объём этого захода:** токены + компоненты (полная перебаза), одним планом в 3 стадии.

## Не-цели (YAGNI)

- Не тянуть styled-components / floating-ui / tanstack-virtual — переизлагаем, не копируем рантайм.
- Не поддерживать бренды MyQRcards/CardEx.
- Не удалять наши 12 надстроек, которых нет в официальной DS — помечаем как «неофициальные».
- Не менять npm-scope (`@cvetkov_es/*` остаётся; смена — отдельное позднее решение).
- Не строить постоянный CI-пайплайн синхронизации — экстрактор запускается вручную по необходимости.

## Архитектура

Три стадии, порядок по зависимостям; стадия 1 — гейт.

### Стадия 1 — Токены (фундамент, гейт)

**Экстрактор** `tools/extract-official-tokens.mjs`:
1. Скачивает закреплённый tarball: `npm pack @hubex/design-system@0.4.0`.
2. Достаёт объект `themes` из `dist/esm/index.js` **без исполнения модуля**
   (locate `var M={HubEx:…}` → баланс скобок → `eval` только литерала объекта;
   styled-components/react не требуются). Берёт ветку `HubEx`.
3. Прогоняет через **правила маппинга** (ниже) → пишет `packages/tokens/src/tokens.json`.
4. **Гард против дрейфа:** сверяет число/форму листьев с `tokens.d.ts` пакета; при
   расхождении падает (значит структура источника поменялась — маппинг пересмотреть).

**Правила маппинга** (ключевой момент — это НЕ плоский ренейм):
- Простые цветовые/размерные листья: `colors.text.color-text-primary` →
  `--hx-color-text-primary` (имя листа с префиксом `--hx-`).
- **Опечатка источника** `color-backgroundg-warning/-error` → чиним в
  `--hx-color-background-warning/-error`. Источник помечаем в комментарии/доке
  (в самом Figma/DS опечатка остаётся — чинить там не наша задача).
- **Составные токены — явные под-правила (иначе получается мусор `--hx-style/-x/-blur`):**
  - `borderRadius.border-radius-*` → `--hx-border-radius-*` (small=3, medium=5, circle=50%, pill=9999).
  - `spaces.spacing-x*` → `--hx-spacing-x*`; `unit-base` → `--hx-unit-base` (4px).
  - `sizes.<grp>.size-*` → `--hx-size-*` (button/icon x3..x16/loader/input/search/tab).
  - `typography.<grp>.font-*` (объект `{fontFamily,fontWeight,fontSize,lineHeight}`) →
    набор под-токенов на каждый шрифт: `--hx-font-<name>-size|-weight|-line-height|-family`
    (напр. `--hx-font-body-regular-size:13px` и т.д.). Композитный алиас не делаем —
    CSS собирает из под-токенов.
  - `shadows[]` (объект `{x,y,blur,spread,color,type}`) → готовое значение
    `--hx-shadow-<name>: <x> <y> <blur> <spread> <color>` (base/colored/actionpanel).
  - `borderStyle.border-*.{style}` → `--hx-border-<name>-style` (solid/dashed).
  - `fontFamilies.font-family` → `--hx-font-family`.
- **Наши инвентированные токены, которых нет в официальной DS:** `--hx-color-menu-background-focus`,
  census-`--hx-font-size-base/lg/sm` → удалить как канонические; при риске поломки оставить
  тонкими алиасами на ближайший официальный (`font-size-base`→`font-body-regular-size`).
  Наши старые `--hx-radius-*` и `--hx-size-x*` заменяются официальными
  `--hx-border-radius-*` / `--hx-spacing-*` — старые оставляем **алиасами** (не ломать published API).

Затем обычный конвейер: Style Dictionary → `dist/variables.css` + JS/JSON.
Тест `tokens/build.test.mjs` обновляется: проверяет присутствие новых групп, отсутствие
`backgroundg`, соответствие числа токенов извлечённому набору.

### Стадия 2 — Существующие компоненты + CSS (ломающая)

11 общих компонентов (Avatar, Badge, Button, Checkbox, Icon, Input, Pagination, Radio,
Select, Toggle, Tooltip) выравниваются под официальные `.d.ts`:
- Пропы/варианты/состояния по официальному типу (пример: Button `size: 'sm'|'md'` →
  `'small'|'medium'`; добавить `round`, `loading`, `error`, `fullWidth`, `iconColor`).
- **Ломающие ренеймы пропов** — где дёшево, старое имя оставляем алиасом (как secondary/ghost);
  где нет — документируем в CHANGELOG/README как breaking.
- CSS `.hx-*` переводится на новые/переименованные токены; `var()`-валидатор
  (`packages/css`) ловит мёртвые ссылки — гейт стадии.

### Стадия 3 — Новые компоненты (аддитивная)

10 недостающих: Dropdown, Info, InputBase, Link, Loader, Popover, Search,
SegmentedControl, Text, TextArea. Реализация в нашем стиле: CSS-классы + тонкий React,
`sideEffects:false`, без styled-components. Для Popover/Dropdown/Search, где официальная
DS использует floating-ui/virtual, — минимальная своя реализация или тонкая зависимость,
решается по-компонентно в плане (по умолчанию — без рантайм-зависимостей).

Наши 12 надстроек (Modal, Table, Tabs, Drawer, Calendar, DatePicker, Chip, Tag, Alert,
Menu, Label, Field) остаются, помечаются в llms.txt как «расширения, вне официальной DS».

### Финал — Докá и релиз

- `llms.txt` регенерируется из новых токенов (verbatim-таблица) + обновлённые API компонентов
  + пометка неофициальных надстроек + строка «выведено из `@hubex/design-system@0.4.0`».
- README: breaking-раздел (перебаза источника, изменения токенов/API).
- playground обновляется под новые токены/компоненты.
- changeset (ломающий; <1.0 сохраняем → bump линейки `0.4.0`), PR в master.
  **Тег `vX.Y.Z` пушит пользователь** (классификатор харнеса блокирует пуш тега мне).

## Тестирование

- `tokens`: build-тест на новые группы + запрет `backgroundg` + сверка с `tokens.d.ts`.
- `css`: `var()`-валидатор (0 мёртвых ссылок) — гейт.
- `react`: юнит-тесты на каждый компонент (существующие обновить, новым — добавить),
  `treeshake.test.mjs` (Button-only бандл остаётся малым, без react-dom/styled-components).
- Сквозной consumer-smoke по tarball’ам перед релизом.

## Риски

- **Составные токены** (typography/shadows) — маппинг нетривиален; смягчение: явные правила выше + тесты.
- **Ломающие ренеймы пропов** ломают существующих потребителей; смягчение: алиасы где дёшево + CHANGELOG.
- **Дрейф источника** при будущих релизах DS; смягчение: гард экстрактора против `tokens.d.ts`.
- **Извлечение через eval литерала** хрупко к смене сборки DS; смягчение: гард + фикс версии 0.4.0.
- Экстрактор `eval`-ит только объектный литерал из доверенного пакета — не исполняет код модуля.

## Приложение: сводка diff токенов

- Официальные листья HubEx: ~152 канонических (167 сырых с учётом под-полей составных).
- Наши текущие: 104.
- **Добавляется:** вся `spacing`-шкала (x0..x16 + unit-base), `sizes` (button/icon/loader/input/
  search/tab), `typography` (H0-H3 + body/paragraph/tooltip/caption под-токенами), `shadows`
  (base/colored/actionpanel), `borderStyle` (solid/dashed), недостающие цвета
  (`color-border-weak/-success` и др.).
- **Переименовывается (со старыми алиасами):** `--hx-radius-*` → `--hx-border-radius-*`;
  `--hx-size-x*` → `--hx-spacing-x*`.
- **Удаляется/алиасится:** `--hx-color-menu-background-focus`, census-`--hx-font-size-*`.
