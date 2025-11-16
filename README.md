# HealthCartPlus
HealthCart+ – Your trusted online pharmacy for fast, affordable medicine delivery and doctor consultations in India.

# HealthCart+ – Online Pharmacy (Frontend SPA)

HealthCart+ is a **single-page web app** (HTML, CSS, JS) that simulates an online pharmacy and healthcare platform for India (Kolkata-focused), using **localStorage** as a mock backend.

## Features

- **Home page**
  - Hero banner, quick actions, categories
  - Featured and best-discount medicines

- **Auth**
  - Login (email/phone + password)
  - Registration **without OTP** (direct sign-up)
  - User session saved in localStorage

- **Products**
  - Mock medicine catalog
  - Search, category & prescription filters
  - Sorting (name, price, discount)
  - Product detail with pricing, stock, Rx tag, add to cart/wishlist

- **Cart & Checkout**
  - Quantity update, remove items
  - Summary with discount, delivery, GST
  - Address selection + add new address (modal)
  - Payment method selection (simulated only)
  - Order placement via mock API

- **Orders & Profile**
  - Order confirmation + invoice download (txt)
  - Order tracking timeline
  - Profile view with tabs (profile, addresses, orders, wallet, refills)

- **Extras**
  - Prescription upload (image/PDF preview, metadata saved)
  - Telemedicine doctor list + appointment booking modal
  - Support page with contact form, FAQ & live chat modal
  - Floating AI chat bot (rule-based, chat history in localStorage)
  - Admin dashboard UI (stats + recent orders table)

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Hash-based routing (`#/...`)
- localStorage for users, products, cart, orders, etc.

