# Typescript REST API Serverless

It provides a well-structured, scalable, and maintainable foundation for developing serverless applications.

The API is structured around a CRUD system, serving as a practical example to demonstrate best practices in serverless development, including:

- Dynamoose ORM for DynamoDB integration;
- Zod for request validation;
- Automated testing with Jest;
- CI/CD pipelines using GitHub Actions.

## Technologies used

- **Node.js 18.x** (Managed via `.nvmrc`)
- **TypeScript**
- **AWS Lambda**
- **AWS API Gateway**
- **Knex + PostgresSQL**
- **Serverless Framework** (^3.40.0)
- **GitHub Actions** (CI/CD)
- **Jest** (Unit Testing)
- **Zod** (Data Validation)

---

## Project structure

The project follows a **clean architecture** approach, incorporating principles of **hexagonal architecture** to ensure modularity, scalability, and maintainability. Each layer has a well-defined responsibility:

```
src/
│── shared/                       # Shared code between Use Cases
│   ├── api-gateway-response.ts   # Helpers for HTTP responses
│   ├── interfaces/               # Common project interfaces
│   ├── models/                   # Models (Order, etc.)
│   ├── repositories/             # Database access repositories
│── use-cases/                    # Business logic (Use Cases)
│   ├── create-order/
|       ├── controller.ts         # Entry point for external communication
|       ├── usecase.ts            # Business logic
|       ├── usecase.spec.ts       # Unit test
|       ├── validator.ts          # Zod Schema and type
│   ├── get-order/
│   ├── update-order-status/
│   ├── delete-order/
serverless.yml                    # Serverless Framework configuration
jest.config.js                    # Jest configuration
.nvmrc                            # Node.js version management
```

---

## How to run the project

### **1️. Set up environment**

1. **Install Node.js 18.x** (Recommended via `nvm`)

   ```sh
   nvm use
   ```

   If you don’t have **nvm**, install the correct Node version manually.

2. **Install dependencies**
   ```sh
   pnpm install
   ```
   You can use `npm` or `yarn`.

---

### **2️. Configure AWS credentials**

The project uses **AWS IAM Role** for deployment and execution. Before running locally, set up your credentials by creating a `.env` file in the project root:

```sh
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

Alternatively, you can set them manually in your terminal:

```sh
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

For production environments, credentials are configured via **GitHub Secrets**.

---

### **3️. Run locally**

To run the local environment with **Serverless Offline**:

```sh
pnpm start
```

This will expose the API locally on port **3000**.

For faster development and testing, use the following command:

```sh
pnpm dev
```

This runs the project with nodemon, automatically reloading the application whenever a file is modified, improving the development workflow.

---

### **4️. Run tests**

The project uses Jest for unit testing, and all use-cases are covered **100%**. To run the tests:

```sh
pnpm test
```

To run tests in watch mode (rerun tests automatically on file changes):

```sh
pnpm test:watch
```

To generate a test coverage report:

```sh
pnpm test:coverage
```

Tests are required before **deployment to AWS** (validated via GitHub Actions).

---

## Available endpoints

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| POST   | `/orders`                | Create a new order      |
| GET    | `/orders/{orderId}`      | Retrieve an order by ID |
| GET    | `/users/{userId}/orders` | Retrieve orders by user |
| PUT    | `/orders/{orderId}`      | Update order status     |
| DELETE | `/orders/{orderId}`      | Delete an order by ID   |

---

## **Data validation (Zod)**

The project uses Zod for input validation, ensuring that all API requests conform to the expected structure:

- Required fields are filled
- `status` contains valid values (`RECEIVED`, `DELIVERED`, etc.)
- `products` contains at least one item

**Example validation**

```ts
const orderValidatorSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  products: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      }),
    )
    .min(1, 'At least one item is required'),
  status: z.enum([
    'RECEIVED',
    'IN_PREPARATION',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
});
```

**Automatic type inference**
Zod automatically exports TypeScript types based on the defined schema, eliminating the need for redundant manual typings.

Example of type inference from a validation schema:

```ts
export type CreateOrderValidatedDTO = z.infer<
  typeof createOrderValidatorSchema
>;
```

**Usage Example**
Instead of manually defining an interface for the validated data, we can directly use the inferred type:

```ts
const validation = createOrderValidatorSchema.safeParse(body);

if (!validation.success) {
  return badRequest(validation.error.format());
}

const bodyParsed: CreateOrderValidatedDTO = validation.data;
```

---

## **Database Configuration**

This project now uses **PostgreSQL** as the database, managed via **Knex.js** as a query builder. Below, you’ll find all the necessary details to set up and work with the database in both local and production environments.

### **1️. Running PostgreSQL Locally with Docker**

For local development, we use a **Docker container** to run PostgreSQL. You can start it using the provided `docker-compose.yml` file.

#### **Start the database container:**

```sh
docker-compose up -d
```

This will launch a PostgreSQL instance locally, which can be accessed using the credentials defined in the `.env` file.

#### **Stop the database container:**

```sh
docker-compose down
```

---

### **2. Enviroment Variables**

Before running the project, ensure you have a `.env` file with the necessary database configurations:

```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
```

You can copy the file example (`env-example`) for create a new `.env` file.

**Note:** The NODE_ENV variable defines the environment (development or production). The database credentials must match those inside docker-compose.yml for local development.

### **3. Knex Query Builder**

The project uses [Knex.js](https://knexjs.org/guide/) to interact with PostgreSQL. The configuration is defined inside knexfile.ts, which supports multiple environments (development, production).

Knex is responsible for:

- Querying the database.
- Managing migrations (database schema changes).
- Seeding (pre-populating the database with initial data).

---

### **4. Running migrations**

Migrations allow us to manage database schema changes in a structured way.

**Run all pending migrations:**

```
pnpm knex migrate:latest
```

**Rollback the last migration:**

```
pnpm knex migrate:rollback
```

**Create a new migration file:**

```
pnpm knex migrate:make migration_name
```

This will generate a new file inside src/migrations/, where you can define the schema changes.

---

### **5. Running seeds**

Seeds allow us to populate the database with initial test data.

**Run all seed files:**

```
pnpm knex seed:run
```

**Create a new seed file:**

```
pnpm knex seed:make seed_name
```

This will generate a new file inside src/seeds/, where you can define sample data to insert into tables.

---

### **6. Checking the Database Connection**

To verify that your PostgreSQL instance is running and accepting connections, run:

```
pnpm knex --esm migrate:status
```

If the database is properly set up, you should see the list of executed migrations.

---

## **CI/CD Pipelines (GitHub Actions)**

The application has an **automated workflow** for **testing and deployment** to AWS Lambda.

- ✅ **Tests run before deployment**
- ✅ **Deployment happens only if tests pass**
- ✅ **`dev` and `prod` environments are automatically managed**

---

## **How to deploy to AWS**

The application is integrated with **GitHub Actions**, so deployment happens automatically when pushing to:

- **`dev` → Deploys to development environment**
- **`main` → Deploys to production**

To deploy manually:

```sh
npx sls deploy --stage STAGE_NAME
```

---

## **Best practices followed**

✅ **Use Case based architecture**  
✅ **Data validation with Zod**  
✅ **Scalable NoSQL database (DynamoDB + Dynamoose + Docker)**  
✅ **Mandatory unit tests before deployment**  
✅ **CI/CD with GitHub Actions**  
✅ **Node.js versioning via `.nvmrc`**
