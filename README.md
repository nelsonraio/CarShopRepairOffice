# Car Repair Shop Management System

A comprehensive web application for managing car repair shop operations, built with Next.js, TypeScript, and Tailwind CSS.

## 🚗 Overview

This application provides a complete management system for car repair shops, including client management, vehicle tracking, appointment scheduling, parts inventory, quotes, billing, and kanban-style workflow management.

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.5
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: React 19.2.3
- **Build Tool**: Turbopack (Next.js built-in)
- **Linting**: ESLint 9

## 📁 Project Structure

```
car-repair-shop-gest/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── agenda/            # Appointment scheduling
│   │   ├── balanco/           # Financial reports
│   │   ├── clientes/          # Client management
│   │   ├── faturacao/         # Billing system
│   │   ├── kanban/            # Workflow management
│   │   ├── orcamentos/        # Quotes system
│   │   ├── pecas/             # Parts inventory
│   │   ├── tabelas/           # System tables
│   │   └── veiculos/          # Vehicle management
│   ├── components/            # Reusable UI components
│   │   ├── modals/           # Modal components
│   │   ├── tables/           # Data table components
│   │   └── ui/               # Basic UI elements
│   └── data/                 # Mock data and types
├── public/                   # Static assets
└── static-screens/          # Static HTML screens (legacy)
```

## 🚀 Features

### Core Modules

- **Dashboard**: KPI overview and quick access to main functions
- **Client Management**: Add, edit, and view client information
- **Vehicle Management**: Track vehicles, maintenance history, and client associations
- **Appointment Scheduling**: Calendar-based appointment management
- **Parts Inventory**: Stock management with supplier tracking
- **Quotes System**: Create and manage repair quotes
- **Billing**: Invoice generation and payment tracking
- **Kanban Board**: Workflow management for repair processes
- **Financial Reports**: Balance sheets and profitability analysis

### Key Features

- Responsive design for desktop and mobile
- Real-time search and filtering
- Modal-based forms for data entry
- TypeScript for type safety
- Modern UI with Tailwind CSS
- Component-based architecture

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd car-repair-shop-gest
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add environment variables as needed
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### TypeScript Configuration

The project uses strict TypeScript configuration with:
- ES2017 target
- Strict mode enabled
- Path mapping for `@/*` imports

## 📊 Data Structure

The application uses TypeScript interfaces for type safety:

- `Client`: Client information and statistics
- `Vehicle`: Vehicle details and maintenance history
- `ServiceHistory`: Repair records
- `Part`: Inventory items
- `Appointment`: Scheduled services
- `Mechanic`: Staff information

All data is currently mocked in `src/data/mockData.ts`.

## 🎨 UI/UX Design

- **Color Scheme**: Dark theme with brand yellow accents
- **Typography**: Clean, readable fonts
- **Layout**: Sidebar navigation with main content area
- **Components**: Consistent modal dialogs and form elements
- **Responsive**: Mobile-friendly design

## 🔍 Code Quality

### Linting

```bash
npm run lint
```

### Type Checking

TypeScript compilation is run during build:
```bash
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch
3. Environment variables can be configured in Vercel dashboard

### Other Platforms

The application can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 🔒 Security Considerations

⚠️ **Critical Security Issues Identified:**

1. **Credentials in Plain Text**: Remove any hardcoded credentials from `gesto.txt` and other files
2. **Environment Variables**: Never commit sensitive data to version control
3. **API Security**: Implement proper authentication and authorization
4. **Data Validation**: Add server-side validation for all inputs

## 🚀 Recommended Improvements

### High Priority

1. **Database Integration**
   - Replace mock data with real database (PostgreSQL, MySQL, or MongoDB)
   - Implement proper data persistence

2. **Authentication & Authorization**
   - User authentication system
   - Role-based access control (Admin, Mechanic, Receptionist)

3. **API Layer**
   - RESTful API or GraphQL endpoints
   - Proper error handling and validation

4. **State Management**
   - Implement Zustand, Redux Toolkit, or React Query for complex state
   - Real-time updates for collaborative features

### Medium Priority

5. **Testing**
   - Unit tests with Jest and React Testing Library
   - Integration tests for critical workflows
   - E2E tests with Playwright or Cypress

6. **Performance Optimization**
   - Code splitting and lazy loading
   - Image optimization
   - Database query optimization

7. **Error Handling**
   - Global error boundaries
   - User-friendly error messages
   - Logging system

### Low Priority

8. **Advanced Features**
   - Email notifications for appointments
   - SMS reminders
   - Barcode scanning for parts
   - Integration with accounting software

9. **UI/UX Enhancements**
   - Dark/light theme toggle
   - Improved mobile responsiveness
   - Accessibility improvements (WCAG compliance)

10. **DevOps**
    - CI/CD pipeline
    - Automated testing
    - Monitoring and analytics

## 📈 Business Logic Improvements

Based on team feedback analysis:

1. **Appointment Management**
   - Click-to-edit functionality in calendar
   - Better conflict resolution

2. **Internal Communication**
   - Comments/notes system for processes
   - Team collaboration features

3. **Vehicle History**
   - Complete repair process tracking
   - Better historical data visualization

4. **Parts Management**
   - Invoice number tracking for purchases
   - Better supplier management

5. **Quotes Workflow**
   - Clear approval/rejection states
   - Simplified pricing display

6. **Billing System**
   - Consistent data requirements
   - Integration with payment processors

7. **Reporting**
   - Profitability reports by process
   - Better financial analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Write descriptive commit messages
- Add tests for new features

## 📄 License

This project is private and proprietary.

## 📞 Support

For support or questions, please contact the development team.

---

**Note**: This application is currently using mock data. For production use, implement proper database integration and security measures as outlined in the improvements section.
