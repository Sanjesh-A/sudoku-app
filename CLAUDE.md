# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo for a Sudoku web app with daily puzzles, difficulty levels, and leaderboards. Phased rollout:

- `web/` — React 19 + TypeScript + Vite frontend (only piece that currently exists)
- `api/` — Spring Boot backend (Phase 2, not yet present)
- `infra/` — Terraform configurations (Phase 3, not yet present)
- `shared/` — Shared TypeScript types (Phase 2, not yet present)

## Current state

`web/` is freshly scaffolded — `web/src/App.tsx` is still the default Vite+React template (logo, counter button, doc links). No Sudoku domain logic, routing, state management, or API integration exists yet. Anything you build will likely be the first instance of its kind in this repo, so there are no existing patterns to follow within the app code itself.

## Commands

All commands run from `web/`:

- `npm run dev` — Vite dev server with HMR
- `npm run build` — runs `tsc -b` (project-references type-check across `tsconfig.app.json` and `tsconfig.node.json`) **then** `vite build`. Type errors fail the build.
- `npm run lint` — ESLint flat config (`eslint.config.js`) over `**/*.{ts,tsx}`
- `npm run preview` — preview the production build

No test runner is configured yet.

## Toolchain notes

The stack pins unusually new majors — React 19, Vite 8, TypeScript ~6.0, ESLint 10, `typescript-eslint` 8, `@vitejs/plugin-react` 6. When reaching for plugins/configs, verify compatibility with these majors rather than assuming the latest tutorial online still applies.

The repo's only non-scaffolding commit so far is `22b901c Point to the correct npm registry` — if `npm install` fails with auth or registry errors, that's the historical context (currently no `.npmrc` is checked in at any level).
