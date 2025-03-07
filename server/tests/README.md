# Voice Hire Server Tests

This directory contains automated tests for the Voice Hire server application.

## Test Structure

- `setup.js`: Contains setup and teardown functions for the test database
- `auth.test.js`: Tests for authentication routes and functionality
- `interviews.test.js`: Tests for interview management routes and functionality
- `middleware.test.js`: Tests for middleware functions, particularly auth middleware
- `models.test.js`: Tests for database models (User and Interview)
- `db.test.js`: Tests for database connection functionality
- `aiAgent.test.js`: Tests for AI agent functionality

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode (tests will re-run when files change):

```bash
npm run test:watch
```

To run tests with coverage report:

```bash
npm run test:coverage
```

## Test Environment

Tests use an in-memory MongoDB database via `mongodb-memory-server` to avoid affecting your actual database. This allows tests to run in isolation and ensures that your development or production data is not modified during testing.

## Adding New Tests

When adding new features to the server, please add corresponding tests following the patterns established in the existing test files. Each test file focuses on a specific component of the system, making it easier to locate and update tests as the codebase evolves.

## Best Practices

1. Keep tests isolated - each test should be independent and not rely on the state from other tests
2. Use descriptive test names that clearly indicate what is being tested
3. Follow the AAA pattern (Arrange, Act, Assert) for clarity
4. Mock external dependencies when appropriate
5. Test both success and failure cases
