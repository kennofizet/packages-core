# packages-core/frontend

This package is the **core base package** for the frontend ecosystem. It provides shared configurations, base components, and utilities that other frontend packages build upon.

## Purpose

This package handles the base settings and management for:

- **Zone** — Core zone configuration and display logic
- **Zone Management** — Zone UI components and management views
- **Server** — Server connection state and settings UI
- **Token** — Base token display, balance, and transaction UI primitives

Other packages (e.g. `********-frontend`) extend or consume the components and utilities provided here. This package should be installed first as a dependency before any feature-level frontend packages.

## Installation

```bash
npm install @kennofizet/packages-core-frontend
```
