# Car Shop Repair Office Management System

## Overview
A comprehensive web application for managing a car repair shop, built with Next.js, TypeScript, Prisma, and PostgreSQL. The system handles vehicle registration, client management, appointments, work orders, inventory, and billing.

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Database**: PostgreSQL with Prisma schema
- **Styling**: Tailwind CSS with custom brand colors
- **Deployment**: Vercel (recommended)

## Key Features
- Vehicle registration with auto-fill from existing appointments
- Client management with search and autocomplete
- Appointment scheduling and management
- Work order tracking
- Parts inventory management
- Billing and invoicing
- Mechanic assignment
- Service type management
- Brand and model database

## Database Schema
- **Clientes**: Client information (name, phone, email, NIF, address)
- **Veiculos**: Vehicle details (license plate, VIN, make, model, year, mileage)
- **Agendamentos**: Appointments (date, time, service type, mechanic, notes)
- **OrdensTrabalho**: Work orders
- **Servicos**: Service types
- **Marcas/Modelos**: Vehicle brands and models
- **Mecanicos**: Mechanics
- **Pecas**: Parts inventory

## API Endpoints
- `/api/clientes`: CRUD operations for clients
- `/api/veiculos`: Vehicle management
- `/api/agendamentos`: Appointment scheduling
- `/api/servicos`: Service types
- `/api/marcas`: Vehicle brands
- `/api/modelos`: Vehicle models
- `/api/mecanicos`: Mechanics
- `/api/ordens-trabalho`: Work orders

## Getting Started
1. Install dependencies: `npm install`
2. Set up database: Configure PostgreSQL and run `npx prisma migrate dev`
3. Seed data: Run seed scripts in `/scripts` directory
4. Start development: `npm run dev`

## Build & Deployment
- Build: `npm run build`
- Start production: `npm start`
- Deploy to Vercel: Connect repository and deploy

## Key Components
- **NewVehicleModal**: Vehicle registration with auto-fill
- **AppointmentModal**: Appointment creation/editing
- **ClientTable**: Client management interface
- **VehiclesTable**: Vehicle listing
- **Calendar**: Appointment scheduling

## Recent Fixes
- Fixed TypeScript errors in date parsing
- Added auto-fill functionality for vehicle data from appointments
- Resolved build compilation issues

## TODO
- Implement full work order management
- Add billing/invoicing system
- Enhance reporting and analytics
- Add user authentication and roles
- Implement real-time notifications
