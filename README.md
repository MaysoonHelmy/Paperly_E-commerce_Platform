# Paperly-Eccomerce-Platform

![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Key Dependencies](#key-dependencies)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Contributing](#contributing)

## Description

Paperly-Eccomerce-Platform — a frontend web app built with .NET, JavaScript, React, Vite.

## Tech Stack

- 🔷 **.NET**
- 🟨 **JavaScript**
- ⚛️ **React**
- ⚡ **Vite**

## Quick Start

```bash

# 1. Clone the repository
git clone https://github.com/MaysoonHelmy/Paperly-Eccomerce-Website.git

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

## Key Dependencies

```
react: ^19.2.6
react-dom: ^19.2.6
```

## Available Scripts

- **dev** — `npm run dev`
- **build** — `npm run build`
- **lint** — `npm run lint`
- **preview** — `npm run preview`
- **run** — `dotnet run`
- **test** — `dotnet test`

## Project Structure

```
.
├── EcommerceBackend
│   ├── Controllers
│   │   ├── AddressesController.cs
│   │   ├── AuthController.cs
│   │   ├── CategoriesController.cs
│   │   ├── OrdersController.cs
│   │   ├── ProductsController.cs
│   │   └── UsersController.cs
│   ├── EcommerceBackend.csproj
│   ├── Models
│   │   ├── Address.cs
│   │   ├── Category.cs
│   │   ├── EcommerceDbContext.cs
│   │   ├── Order.cs
│   │   ├── Orderitem.cs
│   │   ├── Orderstatus.cs
│   │   ├── Product.cs
│   │   ├── Role.cs
│   │   └── User.cs
│   ├── Program.cs
│   ├── Services
│   │   ├── AddressService.cs
│   │   ├── AuthService.cs
│   │   ├── CategoryService.cs
│   │   ├── OrderService.cs
│   │   ├── ProductService.cs
│   │   └── UserService.cs
├── Schema.png
└── paperly-store
    ├── src
    │   ├── AdminDashboard.jsx
    │   ├── App.css
    │   ├── App.jsx
    │   ├── AuthScreen.jsx
    │   ├── CartScreen.jsx
    │   ├── CategoriesScreen.jsx
    │   ├── HomeScreen.jsx
    │   ├── OrdersScreen.jsx
    │   ├── ProfileScreen.jsx
    │   ├── assets
    │   │   ├── hero.png
    │   │   ├── react.svg
    │   │   └── vite.svg
    │   ├── index.css
    │   └── main.jsx
    └── vite.config.js
```

## 🛠️ Development Setup

### Node.js / JavaScript
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install`
3. Start the dev server: see the **Quick Start** above

### .NET
1. Install the [.NET SDK](https://dotnet.microsoft.com/)
2. `dotnet restore && dotnet run`
