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

## Zone setting (CRUD + members)

For apps that need zone management UI (create/edit/delete zones, assign/remove members), use the **ZoneSetting** component. It uses the core backend zone APIs; only managers can edit/delete/create/assign (based on `is_manager` from `GET /player/zones`).

**Setup:** Create the zone API with `createCoreZoneApi(coreUrl, token, axios)`, then provide it and register the component:

```js
import { createApp } from 'vue'
import { createCoreZoneApi, installZoneSetting } from '@kennofizet/packages-core-frontend'
import axios from 'axios'
import App from './App.vue'

const app = createApp(App)
const zoneApi = createCoreZoneApi('https://your-api/api/knf', yourToken, axios)
installZoneSetting(app, zoneApi)
app.mount('#app')
```

Use `<KnfCoreZoneSetting />` in your template. The component injects `knfCoreZoneApi`; you can pass props for labels (e.g. `title`, `createLabel`, `editLabel`). Non-managers see a read-only message and their zones list.
