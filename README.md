# BizPilot

BizPilot is a business operations and intelligence dashboard for growing enterprises. It brings sales, purchasing, inventory, customer, supplier, and financial data into one workspace so teams can monitor performance, investigate operational changes, and make informed decisions.

## Features

- Executive dashboard with operational and financial KPIs
- Sales orders, order status tracking, and cancellation workflows
- Purchase order management and supplier records
- Inventory and product management
- Customer management
- Analytics with date filtering and visual reporting
- Pricing and discount simulation tools
- AI Assistant for business questions, summaries, and recommendations
- Notifications, global search, and responsive navigation

## Technology

- React 19 and TypeScript
- Vite for frontend development and production builds
- Express for the application server and API routes
- Tailwind CSS and Lucide React for the interface
- Recharts for analytics visualizations
- Google Gemini API through `@google/genai` for the AI Assistant
- Vitest and Testing Library for automated tests

## Project Structure

```text
src/
  components/   Feature views, modals, layout, and shared UI
  context/      Application state and business operations
  data/         Seed data used by the local application
  __tests__/    Unit and component tests
server.ts       Express server and API routes
```

## Setup

### Prerequisites

- Node.js 18 or later
- A Gemini API key for the AI Assistant

### Installation

```bash
npm install
```

Create a `.env.local` file, or configure the equivalent environment variables in your shell:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

`GEMINI_API_KEY` is used by the server-side AI Assistant endpoint. `APP_URL` identifies the application URL for self-referential links and callbacks.

## Running the Application

Start the development server with:

```bash
npm run dev
```

The application is served locally at the URL printed by the development server.

Create a production build with:

```bash
npm run build
npm start
```

## Testing and Validation

Run the test suite:

```bash
npm test
```

Run the TypeScript check:

```bash
npm run lint
```

The AI Assistant is an application feature. Its Gemini integration is used to provide business insights and advice within BizPilot; it is not required for the dashboard's core operational workflows.
