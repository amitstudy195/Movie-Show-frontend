# 🎬 Movie Show - Premium Cinema Experience

Welcome to **Movie Show**, a high-fidelity, full-feature movie booking platform designed for maximum visual impact and seamless user interaction. This application replicates a premium cinema booking experience with modern aesthetics and robust functionality.

---

## ✨ Key Features

### 🎞️ Cinematic Discovery
- **Trending Motion Cards**: Explore top-rated movies with a dynamic, hovering trending section.
- **Advanced Filtering**: Narrow down movies by Genre, Release Year, and Audience Rating.
- **Deep Search**: Instant search indexing for the entire movie database.
- **Smart Modals**: High-performance modals for movie details, trailers, and cast information.

### 🎟️ Intelligent Booking Flow
- **Interactive Seat Selection**: Choose your preferred seats in a real-time reactive theater layout.
- **Automatic Location Detection**: Built-in geolocation to suggest theaters near you (currently supporting Mumbai, Delhi, Bangalore, etc.).
- **Digital Entries**: Secure, high-resolution E-tickets generated for every booking.

### 🖨️ Premium Ticket Printing (New)
- **High-Fidelity PDF Exports**: Custom-engineered print system to preserve the "Dark Mode" aesthetic.
- **Dynamic QR Codes**: Scannable QR codes for ticket validation at theater entrances.
- **Auto-Formatting**: Smart CSS normalization ensuring tickets fit perfectly on A4 or Letter paper.

### 🛡️ User & Admin Ecosystem
- **Secure Authentication**: Robust Sign-up/Login flow with password reset capabilities.
- **Personalized Profile**: Manage your identity, preferences, and view your entire booking history.
- **Admin Dashboard**: Comprehensive control panel to manage movies, theaters, and screening schedules.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 (Vite) |
| **Styling** | Tailwind CSS v4 (Modern Color Engine) |
| **Icons** | Lucide React |
| **Typography** | Google Fonts (Outfit, Inter) |
| **PDF Engine** | Native Print Isolation + `jsPDF` Support |
| **Maps/Geo** | OpenStreetMap (Nominatim API) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd movie-show/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔑 Admin Access
To access the administrative control panel:
1. Sign in with an account having `isAdmin: true` status.
2. Navigate to `/admin` in your browser.
3. Use the dashboard to synchronize theaters and update movie listings.

---

## 👨‍💻 Development
This project follows a component-based architecture for maximum reusability. Key styles are defined in `index.css` using modern CSS variables and Tailwind utility classes.

Made with ❤️ by the Movie Show Team.
