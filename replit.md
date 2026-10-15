# Nandish Homes

Hotel and villa booking for a quiet, design-led stay in Pondicherry.

## Run & Operate

- `pnpm --dir frontend start` — run the Angular customer UI (port 5000)
- `cd backend && mvn spring-boot:run` — run the Spring Boot REST API (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --dir frontend run build` — build the Angular application
- `cd backend && mvn verify` — compile and verify the Spring Boot API
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Run `backend/src/main/resources/db/schema.sql` once in Oracle before starting with `spring.jpa.hibernate.ddl-auto=validate`.
- `Backend API` workflow uses the isolated `dev` profile with H2 seed data for local preview; the default profile remains Oracle.
- Required backend env: `ORACLE_USERNAME`, `ORACLE_PASSWORD`, and `JWT_SECRET` (at least 32 characters).

## Stack

- Frontend: Angular standalone components, TypeScript, Angular Router and HttpClient
- Backend: Java 17 source level, Spring Boot 3.4, Spring MVC, Spring Data JPA/Hibernate
- Database: Oracle via Oracle JDBC; schema validation is enabled
- Security: Spring Security, BCrypt, JWT; Angular interceptor attaches admin bearer tokens
- Build: Maven for the API, pnpm/Angular CLI for the UI

## Where things live

- `frontend/src/app/app.component.ts` — public home page, availability search and booking modal
- `frontend/src/styles.css` — Nandish Homes visual system and responsive layout
- `frontend/src/app/core/services/api.service.ts` — REST-only frontend integration
- `backend/src/main/java/com/nandishhomes/room` — room/room type domain and availability query
- `backend/src/main/java/com/nandishhomes/booking` — transactional booking flow and pricing
- `backend/src/main/java/com/nandishhomes/security` — JWT filter and route authorization
- `backend/src/main/resources/db/schema.sql` — Oracle DDL source of truth

## Architecture decisions

- Public pages are server-backed through `/api/public`; the Angular client never accesses Oracle directly.
- Availability treats only active rooms and non-cancelled/non-expired bookings as blocking inventory.
- The backend calculates totals from the room price and stay nights; client totals are display-only.
- Production secrets are environment variables; no database or JWT secret is committed.

## Product

The public experience presents Nandish Homes rooms, an availability search, guest details, server-created booking references, and a staff login entry point. The API foundation is ready for payment verification and admin modules.

## User preferences

- Use Angular + TypeScript on the frontend and Java 17 + Spring Boot + Oracle on the backend.
- Do not introduce Lombok, Swagger, Docker, or direct frontend-to-database access.

## Gotchas

- The API intentionally fails fast if `JWT_SECRET` is missing or shorter than 32 characters.
- The Oracle schema must exist before the API can start with `ddl-auto=validate`.

## Pointers

- See `backend/pom.xml` and `frontend/package.json` for dependency sources.
