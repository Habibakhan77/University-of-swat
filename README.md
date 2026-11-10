# University of Swat — Official Website

A full-stack replacement for [uswat.edu.pk](https://uswat.edu.pk), built for the DCST
"Designing the Official Website of the University of Swat" competition.

## Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | Next.js (App Router), React, TypeScript (strict), Tailwind CSS |
| CMS        | Strapi v5 (headless)                                    |
| Database   | PostgreSQL                                              |
| Runtime    | Node.js 22 LTS                                          |
| Deployment | Docker + docker-compose, Nginx, Cloudflare, GitHub Actions |

## Repository layout

```
/frontend                 Next.js app
/cms                      Strapi app
/nginx/nginx.conf         Reverse proxy config
docker-compose.yml        Production stack
.github/workflows/ci.yml  CI pipeline
```

## Local development (prerequisites)

- Node.js 22 LTS (see `.nvmrc`)
- PostgreSQL 17 with a database `uswat` owned by a role `uswat`
- Copy `cms/.env.example` to `cms/.env` and set `DATABASE_PASSWORD`

Full setup instructions, architecture diagram, screenshots and Lighthouse scores will be added as the project is built.
