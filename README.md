# 💬 MyChat App

A **real-time chat application** built using **Django (backend)** and **React.js (frontend)**. This app enables users to exchange messages instantly with a clean and responsive UI.

---

## 🚀 Features

- 🔐 User Authentication (Signup, Login, Logout)
- 💬 Real-time chat using Django Channels (WebSockets)
- 👥 Private and group conversations
- 🕒 Message timestamps and read receipts
- ⚙️ REST API communication between Django and React

---

## 🗂️ Project Structure

```
mychat-app/
│
├── backend/
│   ├── chat/               # Chat models, views, routing
│   ├── accounts/              # Authentication app
│   ├── backend/             # Project configuration and settings
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── public/
│
├── .env
├── .gitignore
└── README.md
```

---

## ⚙️ Installation and Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Joelite17/Chat-App.git
cd mychat-app
```

---

### 2️⃣ Backend Setup (Django)

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_app_password
```

Apply migrations and run the development server:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Backend runs at → http://127.0.0.1:8000/

---

### 3️⃣ Frontend Setup (React + Vite)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at → http://localhost:5173/

---

### 4️⃣ Connect Frontend and Backend

In your **frontend `.env`**, add:

```
VITE_API_URL=http://127.0.0.1:8000
```

---

## 🧠 Development Notes

- **Django Channels** powers real-time communication.
- **Axios** connects React to the Django REST API.
- In production, React can be built (`npm run build`) and served via Django static files.

---

## ☁️ Deployment

Before pushing to GitHub, ensure `.gitignore` includes:

```
venv/
node_modules/
.env
__pycache__/
*.pyc
dist/
```

Then push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - MyChat App"
git branch -M main
git remote add origin https://github.com/Joelite17/Chat-App.git
git push -u origin main
```

---

## 📦 Backend Requirements (`requirements.txt`)

```
Django>=5.0
djangorestframework
django-cors-headers
channels
channels-redis
daphne
python-dotenv
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React.js (Vite), Axios, Tailwind CSS |
| Backend | Django, Django REST Framework, Channels |
| Database | SQLite (Dev) / PostgreSQL (Prod) |
| Realtime | WebSockets via Django Channels |
| Deployment | Render / Railway / Vercel |

---

## 👨‍💻 Author

**Josiah Chinedu**  
📧 [chinedujosiahjkl@gmail.com](mailto:chinedujosiahjkl@gmail.com)  
🔗 [GitHub](https://github.com/Joelite17)  
🔗 [LinkedIn](https://www.linkedin.com/in/josiah-chinedu-2138a4250/)
