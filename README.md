# Brigada Web CMS - Admin Panel

Administrative web panel for the Brigada survey system.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State Management)
- **Axios** (API Communication)
- **React Hook Form + Zod** (Form Validation)

## Project Structure

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Key Features

- Role-based access control (Admin)
- User management
- Survey creation and versioning
- Assignment management
- Real-time monitoring
- Document configuration with OCR support

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
