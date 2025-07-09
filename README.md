# Restaurant Management System

A comprehensive restaurant management system built with Django REST Framework backend and React frontend. This project provides an end-to-end solution for managing orders, customers, and menu items, complete with a powerful administration dashboard.

## Features

- **User Management**: Registration, authentication, and role-based permissions
- **Menu Management**: Add, edit, and organize dishes with categories and images
- **Order System**: Complete order lifecycle from placement to delivery
- **Payment Integration**: Secure payment processing with Stripe
- **Admin Dashboard**: Centralized management interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Notifications**: Instant updates for orders and system events
- **Inventory Tracking**: Monitor stock levels with automated alerts
- **Analytics**: Performance insights and reporting

## Tech Stack

**Backend:**
- Django & Django REST Framework
- PostgreSQL (Production) / SQLite (Development)
- Stripe API

**Frontend:**
- React with Vite
- Tailwind CSS
- Zustand (State Management)
- React Query (Data Fetching)

## Installation

### Backend Setup

```bash
git clone https://github.com/your-username/Restaurant.git
cd Restaurant/restaurant-backend

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd restaurant-frontend
npm install
npm run dev
```

## Usage

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **Admin Panel**: http://127.0.0.1:8000/admin
- **API Documentation**: http://127.0.0.1:8000/api/docs


## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

---

Built with Django and React
