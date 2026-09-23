# BISHAL MART

BISHAL MART is a full-stack e-commerce web application built with a **Spring Boot** backend and a **React (Vite)** frontend. It allows users to browse products, manage their cart, place orders, and check out securely.

## 🛠️ Tech Stack

**Backend:**
- Java, Spring Boot
- Spring Data JPA (Repository layer)
- DTO / Mapper pattern for clean data transfer
- Custom exception handling

**Frontend:**
- React (Vite)
- JSX Components with CSS modules

## 📂 Project Structure

### Backend (`ecombackend`)

```
com/bishal/ecombackend/
├── config/          # App & security configuration
├── controller/      # REST API controllers
├── dto/             # Data Transfer Objects
├── exception/       # Custom exceptions & global exception handling
├── mapper/          # Entity <-> DTO mappers
├── model/           # JPA entities
├── repo/            # Spring Data repositories
├── service/         # Business logic
└── EComBackendApplication.java   # Main application entry point
```

### Frontend

```
src/
├── Components/
│   ├── Header.jsx
│   └── Header.css
├── Pages/
│   ├── Checkout/
│   ├── Home/
│   ├── orders/
│   ├── NotFound.jsx
│   └── NotFound.css
├── util/
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## 🚀 Features

- User authentication (login/signup)
- Product browsing and search
- Shopping cart
- Checkout flow
- Order placement and order history
- Custom error handling with a 404 Not Found page
- Clean REST API architecture (Controller → Service → Repository)

## ⚙️ Installation

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd ecombackend
   ```

2. Configure your database in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/bishalmart
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start on `http://localhost:8080`.

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (default Vite port).

## 🔑 Environment Variables

**Backend** (`application.properties` or `.env`):

| Variable | Description |
|---|---|
| `spring.datasource.url` | Database connection URL |
| `spring.datasource.username` | Database username |
| `spring.datasource.password` | Database password |
| `jwt.secret` | Secret key for JWT authentication |

**Frontend** (`.env`):

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API (e.g. `http://localhost:8080/api`) |

## 📸 Screenshots



