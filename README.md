# MuyuSoft · Web base template

Template base para aplicaciones web de MuyuSoft: Next.js 16 (App Router), React 19, TypeScript estricto, Tailwind CSS 4, next-intl (es/en), Zustand y Vitest.

Comparte la arquitectura del template React Native (features, `shared/`, regla de dos) y la misma paleta de colores.

## Empezar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3000 (redirige a `/es`).

## Scripts

| Script                  | Qué hace                         |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Servidor de desarrollo           |
| `npm run build`         | Build de producción              |
| `npm start`             | Sirve el build                   |
| `npm run typecheck`     | `tsc --noEmit`                   |
| `npm run lint`          | ESLint                           |
| `npm test`              | Vitest (una sola corrida)        |
| `npm run test:watch`    | Vitest en modo watch             |
| `npm run test:coverage` | Cobertura                        |

## Dónde va cada cosa

- `src/app/[locale]/` — solo rutas (page, layout, loading, error).
- `src/features/<dominio>/` — todo el código de producto.
- `src/shared/` — lo que usan 2+ features: componentes, layouts, iconos, utils.
- `src/design/globals.css` — paleta y colores semánticos (modo claro/oscuro).
- `src/locales/{es,en}/translation.json` — textos; toda llave va en ambos.

Las reglas completas están en [AGENTS.md](AGENTS.md).

## Primer paso en un proyecto nuevo

Decide el tipo de proyecto. El detalle está en el §2 del [AGENTS.md](AGENTS.md).

- **Landing o sitio estático.** Borra `src/app/[locale]/(protected)/` y `src/app/api/session/`, y deja `API_URL` vacío. Todas las páginas se generan al hacer el build.
- **App con sesión.** Pon las páginas privadas dentro de `(protected)/`, agrega sus rutas a `PROTECTED_PATH_PREFIXES` en `src/config/auth.config.ts` y construye el login en `/login`. El template no trae login porque el método cambia según el proyecto.

En ambos casos:

- Borra la feature de ejemplo `announcements`: su carpeta en `features/`, su ruta, sus textos y su entrada en `PUBLIC_PATHS`.
- Reemplaza `src/app/icon.svg` por el logo y agrega `src/app/[locale]/opengraph-image.png` (1200×630).
- En producción configura `NEXT_PUBLIC_ENVIRONMENT=production` y `NEXT_PUBLIC_SITE_URL` con el dominio real. Si no, el sitio no se indexa en buscadores.
