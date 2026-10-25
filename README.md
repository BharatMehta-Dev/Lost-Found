# 🔍 Campus Lost & Found Management System

A full-stack web application designed for campus communities (MITS Gwalior) to streamline the process of reporting, discovering, claiming, and returning lost belongings.

---

## 🚀 Key Features

* **🔐 Authentication & User Accounts**
  * Secure student registration and login powered by **Firebase Authentication**.
  * Google Sign-In and email/password authentication.
  * Student profile management with department, year, residence, and contact information.
  * In-app password change and email reset link dispatch.

* **📦 Lost Item Reporting**
  * Report lost belongings with category, brand, color, location (campus/hostel), date, and time.
  * Private verification details field kept hidden from the public to prevent false claims.

* **🏷️ Found Item Listings & Image Uploads**
  * Report found items with automatic client-side image compression.
  * Direct image storage via **Firebase Cloud Storage**.
  * Filter and search found items by category, area type, and specific campus location.

* **🤝 Claim & Verification Workflow**
  * Interactive modal dialog to link your reported lost item to a found item.
  * Submit proof of ownership and custom notes directly to the finder.
  * Finders can review, approve, or reject claims, automatically resolving listings and returning items.

* **🔔 Real-time Notifications**
  * Automated alerts triggered when claims are filed, approved, or rejected.
  * Unread notification count badge and "Mark All as Read" functionality.

* **📊 Student Dashboard**
  * Overview of personal activity: total lost items, found items, active claims, and returned items.
  * Recent activity feed and quick action shortcuts.

---

## 🛠️ Architecture & Tech Stack

```
┌──────────────────────────────────────────────┐
│            Frontend (HTML5 / CSS / JS)       │
│   • Vanilla JavaScript (ES Modules)          │
│   • Custom Design System & Responsive CSS   │
│   • Firebase Client SDK (Auth & Storage)     │
└──────────────────────┬───────────────────────┘
                       │ HTTP / JSON (Bearer Token)
                       ▼
┌──────────────────────────────────────────────┐
│            Backend (Node.js & Express)       │
│   • Express 5 REST API                       │
│   • Firebase Admin SDK                       │
│   • Auth Middleware (JWT Token Verification) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Firebase Cloud Services          │
│   • Google Cloud Firestore (NoSQL Database)  │
│   • Firebase Authentication (User Identity)  │
│   • Firebase Cloud Storage (Item Images)     │
└──────────────────────────────────────────────┘
```

* **Frontend**: Vanilla HTML5, CSS3, modern ES6+ JavaScript modules.
* **Backend**: Node.js, Express `^5.2.1`, `cors`, `dotenv`.
* **Database & Services**: Firebase Admin SDK `^14.5.0` (Firestore, Storage, Auth).

---

## 📁 Project Structure

```
LostandFound/
├── frontend/                     # Client application
│   ├── css/ & style.css          # Design system & stylesheet
│   ├── images/                   # Static icons and logos
│   ├── js/
│   │   ├── auth.js               # Login & Registration logic
│   │   ├── claims.js             # Claims management & verification
│   │   ├── dashboard.js          # Student dashboard & stats
│   │   ├── firebase.js           # Firebase Client SDK & image compression
│   │   ├── found.js              # Found items feed & claim modal
│   │   ├── lost.js               # Lost items reporting & management
│   │   ├── main.js               # Global API helpers, toasts, utils
│   │   ├── notifications.js      # In-app notification center
│   │   └── profile.js            # Profile updates & password management
│   ├── claims.html               # Claims & verification page
│   ├── dashboard.html            # Dashboard page
│   ├── found.html                # Found items page
│   ├── index.html                # Public landing page
│   ├── login.html                # Login page
│   ├── lost.html                 # Lost item reporting page
│   ├── notifications.html        # Notifications page
│   ├── profile.html              # Student profile page
│   └── signup.html               # Registration page
├── backend/                      # REST API Server
│   ├── controllers/
│   │   ├── authController.js     # User registration logic
│   │   ├── claimController.js    # Claim creation & review logic
│   │   ├── dashboardController.js# Aggregated stats & activity
│   │   ├── foundController.js    # Found item CRUD
│   │   ├── lostController.js     # Lost item CRUD
│   │   ├── notificationController.js # Notifications logic
│   │   └── userController.js     # User profile retrieval & updates
│   ├── middleware/
│   │   └── authMiddleware.js     # Firebase ID token verification
│   ├── routes/                   # Express route definitions
│   ├── firebaseAdmin.js          # Firebase Admin SDK initialization
│   ├── server.js                 # Express application entrypoint
│   ├── serviceAccountKey.json    # Firebase service credentials
│   └── .env                      # Environment variables
├── ai-services/                  # (Future Scope) Image matching models
└── README.md
```

---

## 🏃 Getting Started Locally

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm` package manager

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Ensure `backend/.env` is configured (defaults to port 5000):
   ```env
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The API will start at `http://localhost:5000`.*
   *Verify it's running by visiting `http://localhost:5000/api/health`.*

### 3. Frontend Setup
Because the frontend uses modern ES6 modules, it must be served via a local web server (avoid opening `.html` files directly via `file://`).

In a second terminal, run:
```bash
npx serve frontend -p 3000
```
*Or if using Visual Studio Code, right-click `frontend/index.html` and choose **"Open with Live Server"**.*

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📡 API Endpoints Reference

### Authentication & Users
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | No |
| `GET` | `/api/users/me` | Get current user profile | Yes |
| `PUT` | `/api/users/me` | Update profile information | Yes |

### Lost Items
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/lost` | List all active lost items | Yes |
| `POST` | `/api/lost` | Report a new lost item | Yes |
| `GET` | `/api/lost/my` | Get current user's lost reports | Yes |
| `GET` | `/api/lost/:id` | Get details of a single lost item | Yes |
| `PUT` | `/api/lost/:id` | Update lost item report | Yes |
| `DELETE` | `/api/lost/:id` | Delete lost item report | Yes |

### Found Items
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/found` | List all active found items | Yes |
| `POST` | `/api/found` | Report a new found item | Yes |
| `GET` | `/api/found/:id` | Get details of a found item | Yes |

### Claims & Verification
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/claims` | Get current user's claims | Yes |
| `POST` | `/api/claims` | File a claim for a found item | Yes |
| `GET` | `/api/claims/verification` | Get pending claims for review | Yes |
| `PATCH` | `/api/claims/:id/approve` | Approve a claim | Yes |
| `PATCH` | `/api/claims/:id/reject` | Reject a claim | Yes |

### Notifications & Dashboard
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/dashboard` | Get dashboard stats & activity | Yes |
| `GET` | `/api/notifications` | List user notifications | Yes |
| `GET` | `/api/notifications/unread-count` | Get count of unread notifications | Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark single notification as read | Yes |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read | Yes |

---

## 🔮 Future Enhancements
* **AI Image Matching (`ai-services/`)**: Implement automated computer vision similarity matching between images of lost items and newly posted found items.
* **Campus Map Integration**: Interactive GPS/geotagged pins for exact item drop-off and discovery locations.
