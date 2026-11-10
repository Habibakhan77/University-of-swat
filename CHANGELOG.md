# Changelog

## Phase 0 — Setup

- Initialized git repository (`main` branch)
- Created folder structure: `frontend/`, `cms/`, `nginx/`, `.github/workflows/`
- Added `.gitignore`, `.gitattributes` (LF line endings), `.editorconfig`, `.nvmrc` (Node 22)
- Dev machine: Node.js 22.23.4 LTS (replaced Node 26)
- Dev machine: PostgreSQL 17.11 at `C:\PostgreSQL\17`, Windows service `postgresql-17` (auto-start,
  localhost:5432, scram-sha-256). The EDB installer download is blocked (HTTP 403) from this network, so the server
  comes from the `@embedded-postgres/windows-x64` npm build plus `psql`/`pg_isready` from conda-forge.
  `pg_dump`/`pg_restore` are not installed yet.
- Created role `uswat` and database `uswat` (UTF8, owned by `uswat`); credentials in `cms/.env`
  (git-ignored), template in `cms/.env.example`
