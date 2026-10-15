# Nandish Homes — Local Setup

## Requirements

- Java 17 or newer (Java 19/21 also works)
- Maven 3.8+
- Node.js 20+
- pnpm 10+
- Oracle Database only when using the default profile

The repository includes an H2 development profile so the full application can be previewed without Oracle.

## Start the development API

Open the `backend` folder in Spring Tool Suite or VS Code, or run this from the project root:

```bash
cd backend
export JWT_SECRET="local-development-secret-key-which-is-long-enough"
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The development profile uses H2 and seeded room data. The API runs at:

```text
http://localhost:8080
```

The H2 development profile creates four rooms and a local staff account:

```text
Email:    admin@nandishhomes.com
Password: password
```

## Start the Angular application

In a second terminal from the project root:

```bash
pnpm install
pnpm --dir frontend start
```

The customer UI runs at:

```text
http://localhost:5000
```

The Angular development proxy forwards `/api` requests to `http://localhost:8080`.

To build the Angular source without starting it:

```bash
pnpm --dir frontend run build
```

To verify the Java API:

```bash
cd backend
mvn test
```

Start the API before the Angular app. The home page, availability search, booking form,
staff login, and admin dashboard all use the REST API; there is no direct frontend-to-database connection.

## Useful routes

- Customer home: `http://localhost:5000/`
- Rooms: `http://localhost:5000/rooms`
- Staff login: `http://localhost:5000/admin`
- Admin dashboard: `http://localhost:5000/admin/dashboard`
- API health: `http://localhost:8080/actuator/health`

## Use Oracle locally

1. Create an Oracle schema/user.
2. Run `backend/src/main/resources/db/schema.sql`.
3. Set:

```bash
export ORACLE_JDBC_URL="jdbc:oracle:thin:@localhost:1521/XEPDB1"
export ORACLE_USERNAME="your_schema_user"
export ORACLE_PASSWORD="your_schema_password"
export JWT_SECRET="replace-with-a-local-secret-at-least-32-characters"
```

4. Start without the `dev` profile:

```bash
cd backend
mvn spring-boot:run
```

The default profile uses Oracle and `spring.jpa.hibernate.ddl-auto=validate`. The development seed
account is only inserted by `data-dev.sql`; create an admin user in Oracle before using the staff UI there.

## VS Code

Open the unzipped `nandish-homes` folder. Use two terminals:

1. `cd backend && export JWT_SECRET="local-development-secret-key-which-is-long-enough" && mvn spring-boot:run -Dspring-boot.run.profiles=dev`
2. `pnpm --dir frontend start`

## Spring Tool Suite

Import `backend` as an existing Maven project, set the `JWT_SECRET` environment variable,
and run `NandishHomesApplication` with the `dev` profile. Run the Angular command from a
terminal because the frontend is a separate Angular workspace.