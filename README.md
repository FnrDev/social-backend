# Authy 🛡️

Authy is a Node.js authentication server that leverages Express.js for handling HTTP requests, Redis for caching, Prisma as the ORM for database interactions, Zod for input validations, and supports image posts using Amazon AWS S3.
## Features 🚀

- **Express Server**: Authy is built on top of the Express.js framework, providing a robust and scalable foundation for handling HTTP requests.

- **Redis Cache**: Utilizes Redis as a caching mechanism to improve performance by storing frequently accessed data in memory.

- **Prisma ORM**: Implements Prisma as the Object-Relational Mapping (ORM) tool to simplify database interactions and provide type-safe database queries.

- **Zod Validations**: Employs Zod for input validations, ensuring that incoming data adheres to defined schemas, enhancing security and data integrity.

- **AWS S3 Integration**: Supports image posts by leveraging AWS S3 for efficient storage and retrieval of images.

## Getting Started 🚦

### Prerequisites

Before running the Authy server, ensure you have the following installed:

- Node.js (version 16.x or higher)
- Redis server
- PostgreSQL (or your preferred database)

### Installation 🛠️

1. Clone the repository:

    ```bash
    git clone https://github.com/FnrDev/authy-backend.git
    cd authy-backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up your environment variables:

    Create a `.env` file in the project root and configure the following:

    ```env
    PORT=3000
    REDIS_URL=redis://localhost:6379
    POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/database
    POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/database
    AWS_S3_ENDPOINT="Your aws s3 endpoint"
    AWS_S3_TOKEN="Your aws s3 token"
    AWS_S3_SECRET="Your aws s3 secret"
    AWS_S3_ACCESS_KEY="Your aws s3 access key"
    ```

    Adjust the values based on your local setup.

4. Compile TypeScript to JavaScript:

    ```bash
    npm run build
    ```

5. Run the server:

    ```bash
    npm start
    ```

The Authy server should now be running at `http://localhost:3000`.

## Contributing 🤝

Contributions are welcome! If you have any ideas, bug fixes, or improvements, feel free to open an issue or submit a pull request.

## License 📝

This project is licensed under the [MIT License](LICENSE).
