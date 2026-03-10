# 📓 Notebook

Web-based Markdown notebook tool with local file storage and MySQL database.

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Start with Docker

```bash
# Copy environment template
cp .env.example .env

# Start all services (MySQL + App)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access the Application

- **Frontend**: http://localhost:3000
- **MySQL**: localhost:3306 (root password from .env)

---

## 📁 Project Structure

```
notebook/
├── client/              # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   ├── data/
│   └── package.json
├── docker/
│   ├── app/
│   │   └── Dockerfile
│   └── mysql/
│       └── init.sql
├── docs/                # Documentation
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🗄️ Data Storage

All persistent data is stored under `/home/ubuntu-user/docker/notebook/`:

| Directory | Purpose |
|-----------|---------|
| `mysql/data/` | MySQL database files |
| `mysql/logs/` | MySQL logs |
| `data/notes/` | Markdown note files |
| `data/config/` | Application config |

---

## 🛠️ Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Start MySQL (Docker)
docker-compose up -d mysql

# Start client dev server
cd client && npm run dev

# Start server dev server
cd server && npm run dev
```

### Build for Production

```bash
npm run build
docker-compose -f docker-compose.yml up -d --build
```

---

## 📖 Documentation

- [Architecture](docs/architecture.md)
- [Product Requirements](docs/prd.md)
- [Project Overview](docs/project.md)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Editor | Monaco Editor |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Node.js 20 + Express + TypeScript |
| Database | MySQL 8.0 (Docker) |
| Search | flexsearch |

---

## 📝 License

MIT

---

**Star Office Team** © 2026
