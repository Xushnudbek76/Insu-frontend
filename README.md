# INSU Web

INSU Web is the customer-facing frontend for a full-stack insurance platform. It is built with Next.js, TypeScript, Apollo Client, MUI, and SCSS, and connects to the NestJS GraphQL API used by the insurance backend.

The application helps users browse insurance packages, filter plans by category and price, view package details, interact with community posts, upload images, and use authenticated features such as likes, comments, and profile-based actions.

## Features

- Insurance package listing with search, type, status, price, and coverage filters.
- Package detail pages with image support, view counts, likes, comments, and related insurance information.
- Community section with article listing, article detail pages, post creation, image uploads, likes, comments, and view tracking.
- Apollo GraphQL integration using queries and mutations directly from React components.
- Upload-ready Apollo client configuration for GraphQL multipart file uploads.
- JWT-aware client behavior using cookies and token refresh utilities.
- Responsive UI built with Next.js Pages Router, Material UI, SCSS modules, and shared components.
- Internationalization foundation using `next-i18next`, `i18next`, and React i18n tooling.
- Real-time-ready dependency setup with Socket.IO client support.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Apollo Client 4
- GraphQL
- Apollo Upload Client
- Material UI
- SCSS / Sass
- Socket.IO Client
- next-i18next

## Project Structure

```txt
pages/                 Next.js route pages
pages/packages/        Insurance package listing and detail pages
pages/community/       Community listing, detail, and write pages
apollo/                GraphQL client, queries, and mutations
libs/                  Shared helpers, config, and reusable components
scss/                  Global and page-level styles
types/                 Shared TypeScript declarations and app types
public/                Static frontend assets
```

## Environment Variables

Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3007/graphql
NEXT_PUBLIC_API_URL=http://localhost:3007
```

`NEXT_PUBLIC_GRAPHQL_URL` is required for Apollo Client. `NEXT_PUBLIC_API_URL` is used for uploaded images and static backend assets. If it is not provided, the app can derive the API origin from the GraphQL URL.

## Getting Started

### Prerequisites

- Node.js >= 18
- Yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd insu-web
```

2. Install dependencies:

```bash
yarn install
```

3. Configure environment variables:

```bash
# .env.local
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3007/graphql
NEXT_PUBLIC_API_URL=http://localhost:3007
```

4. Start the development server:

```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

Make sure the backend GraphQL API is running before using package, community, upload, like, comment, or authenticated features.

## Available Scripts

| Command      | Description                          |
| ------------ | ------------------------------------ |
| `yarn dev`   | Start the Next.js development server |
| `yarn build` | Build the production frontend        |
| `yarn start` | Start the production build           |
| `yarn lint`  | Run Next.js linting                  |

## API Integration

The frontend communicates with the backend through GraphQL operations stored under `apollo/`. Package pages use package queries and mutations, while the community pages use board article, comment, like, view, and upload operations.

File uploads are sent through `apollo-upload-client`, and the Apollo client includes the required preflight header for Apollo Server CSRF protection.

## Notes

- Run this frontend together with the `insurance-ai` backend.
- Keep the frontend GraphQL URL and backend `PORT_API` aligned.
- Uploaded images are served by the backend, so the API asset base URL must point to the backend server.

## License

Private - All rights reserved.
