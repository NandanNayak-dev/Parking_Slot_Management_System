# Parking Slot Management System

A smart parking slot management web application built with Node.js, Express, MySQL, and EJS. It helps users book parking slots, manage vehicles, make payments, and view booking history, while admins can manage parking locations, bookings, bills, and transactions.

## Features

- User registration and login
- Admin login and dashboard
- Vehicle management
- Parking location and slot booking
- Booking history and ticket generation
- Payment and receipt management
- Admin booking, billing, and transaction management

## Screenshots

### Home Page

![Smart Parking home page](assets/screenshots/home-page.png)

### Customer Screens

#### Add Vehicle

![Add vehicle form](assets/screenshots/add-vehicle.png)

#### Parking Locations

![Parking locations page](assets/screenshots/parking-locations.png)

#### Book Parking Slot

![Book parking slot page](assets/screenshots/book-slot.png)

#### Booking History

![Booking history page](assets/screenshots/booking-history.png)

#### Checkout Bill

![Checkout bill page](assets/screenshots/checkout-bill.png)

### Admin Dashboard

![Admin dashboard](assets/screenshots/admin-dashboard.png)

## Tech Stack

- Node.js
- Express.js
- MySQL
- EJS
- HTML, CSS, JavaScript

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Open the project folder:

```bash
cd Parking_Slot_Management_System
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file and add your database details:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=parking_slot_management
SESSION_SECRET=your_secret_key
PORT=3000
```

5. Set up the database:

```bash
npm run setup-db
```

6. Start the project:

```bash
npm start
```

For development mode:

```bash
npm run dev
```

## Available Scripts

- `npm start` - starts the application
- `npm run dev` - starts the application with nodemon
- `npm run setup-db` - creates and sets up the database
- `npm run check-db` - checks the database connection
- `npm run reset-admins` - resets admin data

## Project Structure

```text
config/        Database and authentication configuration
controllers/   Application logic
database/      Database setup and utility scripts
public/        Static CSS and JavaScript files
routes/        Application routes
views/         EJS view templates
index.js       Main server file
```
