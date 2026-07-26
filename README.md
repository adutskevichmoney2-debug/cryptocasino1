# CryptoCasino

A portfolio-grade, frontend-only demo of a modern crypto casino & sportsbook — the kind of
multi-page product large platforms run, rebuilt from scratch as a clean Next.js codebase.

> **Demo project — no real money.** This build holds no gambling licence, accepts no deposits,
> processes no payments and includes no third-party game content. Balances are simulated and
> everything is stored locally in your browser.

**Русская версия ниже · [Russian version below](#cryptocasino-ru)**

## Features

- **Casino** — lobby with category rows, debounced search, provider multi-filter and sorting,
  104 fictional games with deterministic generated SVG cover art, game pages with a prepared
  **provider integration point** (drop in a launch URL and the iframe goes live), favorites and
  recently played.
- **Sportsbook** — 8 sports, 44 fictional events (live and upcoming), league grouping, market
  accordions, odds in decimal/fractional/american formats, live odds drift with up/down flashes,
  a full betslip (singles and combos, quick stakes, odds-change acceptance), bet history and
  accelerated demo settlement that credits wins back to the wallet.
- **Crypto wallet** — 8 coins, per-coin networks (USDT on TRC20/ERC20/BEP20), personal deposit
  addresses with QR codes, per-network address validation on withdrawals, network fees,
  pending → confirmed transaction lifecycle, multi-balance header pill with fiat conversion
  (USD/EUR/RUB) and a clearly-labelled demo credit button.
- **Accounts** — register/sign-in modals with zod validation and translated error codes, profile
  overview with VIP progress, avatar picker, settings (language, display currency, odds format,
  privacy, reduced motion), password change, 2FA placeholder, three-step KYC placeholder flow,
  referral panel.
- **Bonuses** — promotions with redeemable demo promo codes (`WELCOME100`, `FREESPINS50`,
  `CASHBACK10`, `SPORT25`), wagering progress, VIP levels with cashback, daily/weekly wager race
  with countdown.
- **Support** — searchable help center (24 articles per locale), contact form, floating support
  chat with a locale-aware bot.
- **Platform** — full EN/RU localization (ICU plurals), notifications with toasts, cookie consent,
  legal pages (Terms, Privacy, Responsible Gambling, AML), provably-fair explainer, custom 404,
  responsive from 360 px up with a mobile tab bar.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Zustand ·
next-intl · framer-motion · react-hook-form + zod · lucide-react

No UI kit — the design system (buttons, modals, drawers, dropdowns, toasts, tabs, skeletons…)
is hand-built for this project.

## Architecture: the service layer

Every piece of "backend" data flows through typed service interfaces
([`src/services/types.ts`](src/services/types.ts)). The current implementation
([`src/services/mock`](src/services/mock)) persists to `localStorage` and simulates latency,
confirmations and realtime events. Because the UI only ever imports `services` from
[`src/services`](src/services/index.ts) (enforced by ESLint), swapping in a real backend
(e.g. Supabase) means implementing the same interfaces — no component changes.
See [`src/services/README.md`](src/services/README.md) for the contract.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

Register with any email/password (stored only in your browser), press **Credit demo funds** in
the wallet, and explore: place a combo bet, redeem `WELCOME100`, watch a withdrawal confirm.

## Legal

All game titles, providers, teams, leagues and player names are fictional. The interface and
code are original work; no third-party gambling content is included. See the in-app legal pages
for the full demo disclaimers.

---

<a id="cryptocasino-ru"></a>

# CryptoCasino (RU)

Портфолио-демо современного крипто-казино и букмекера — только фронтенд, без реальных денег.

> **Демо-проект.** Нет игорной лицензии, депозиты не принимаются, платежи не проводятся,
> стороннего игрового контента нет. Балансы симулируются, все данные живут в вашем браузере.

- **Казино**: лобби, поиск, фильтры провайдеров, 104 вымышленные игры с генерируемыми SVG-обложками,
  страница игры с готовой точкой интеграции провайдера, избранное и недавние.
- **Спорт**: 8 видов спорта, лайв и линия, купон (ординары/экспрессы), три формата коэффициентов,
  дрифт котировок, история и ускоренный демо-расчёт ставок с зачислением выигрышей.
- **Кошелёк**: 8 монет, сети (USDT: TRC20/ERC20/BEP20), адреса с QR, валидация адреса по сети,
  комиссии, транзакции pending → confirmed, фиатный эквивалент (USD/EUR/RUB), демо-пополнение.
- **Аккаунт**: регистрация/вход с валидацией, профиль, VIP-прогресс, настройки, смена пароля,
  заглушки 2FA и KYC, рефералы. **Бонусы**: промокоды (`WELCOME100` и др.), отыгрыш, VIP-уровни,
  гонка ставок. **Поддержка**: центр помощи (24 статьи), форма обращения, чат-бот. Полная
  локализация EN/RU, юридические страницы, адаптив от 360 px.

Архитектура построена вокруг сервисного слоя: UI работает только с интерфейсами из
`src/services/types.ts`; текущие моки на `localStorage` заменяются на реальный бэкенд
(например, Supabase) без изменения компонентов.

```bash
npm install && npm run dev
```

Все названия игр, провайдеров, команд и лиг вымышлены.
