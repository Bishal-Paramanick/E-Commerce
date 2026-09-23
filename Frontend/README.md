# ⚡ BISHAL-MART | Full-Stack E-Commerce Platform

A production-ready e-commerce single-page application built with **React 19**, **Vite**, **Axios**, and **Spring Boot**.

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** React 19, Vite, React Router v7, Day.js, Pure CSS Custom Design System.
* **Backend:** Spring Boot (RESTful API), Hibernate / Spring Data JPA, MySQL.
* **API Modules:**
  * Catalog discovery & keyword search (`GET /api/products`)
  * Dynamic multi-option checkout calculations (`GET /api/delivery-options`)
  * Cart state synchronization (`GET`, `POST`, `PUT`, `DELETE /api/cart/{productId}`)
  * Atomic order placement & delivery route computation (`POST /api/orders`)

---

## 🚀 Setup & Local Execution

### Prerequisites
* Node.js (>= 20.x)
* Java JDK 17 or 21
* PostgreSQL instance running on `localhost:5432`

### Run Frontend
```bash
npm install
npm run dev