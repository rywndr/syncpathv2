# Syncpathv2

![Syncpath Landing Page](./public/landing-screenshot.png)

Sebuah aplikasi manajemen proyek dengan fitur Gantt chart yang dibuat dengan Next.js 16. Cocok buat kamu yang butuh visualisasi timeline proyek dengan tampilan yang clean dan modern. aplikasi ini merupakan sebuah project untuk men-support mata kuliah MPTI dan merupakan iterasi kedua dari Syncpathv1 yaitu
[https://github.com/rywndr/mpti_proj](https://github.com/rywndr/mpti_proj)

## Demo

Cek langsung demo-nya di: [https://syncpathv2.vercel.app](https://syncpathtv2h.vercel.app)

## Fitur

- **Gantt Chart Interaktif** - Lihat tasks  dan timeline dalam satu tampilan
- **Task Management** - Kelola tasks dengan mudah (CRUD + drag & drop)
- **Real-time Sync** - Perubahan langsung ke-save
- **Export** - Download sebagai PDF atau PNG
- **Resizable Panels** - Atur ukuran panel task list dan gantt sesuai kemauan
- **Auth System** - Login dengan email/password atau Google/GitHub (supported by better-auth)

![Workspace Screenshot](./public/workspace-screenshot.png)

## Tech Stack

- **Framework**: Next.js 16 (App Router + Cache Components)
- **Database**: PostgreSQL dengan Drizzle ORM
- **Auth**: Better Auth
- **State Management**: Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Form Handling**: TanStack Form + Zod
- **Gantt Library**: gantt package

## Cara Install

### Prerequisites
- Node.js 18+
- PostgreSQL (atau bisa pake Neon/Supabase/Local instance via Docker)
- npm/yarn/pnpm

### Langkah-langkah

1. **Clone repo**

```bash
git clone https://github.com/rywndr/syncpathv2.git
cd syncpathv2
```

2. **Install dependencies**

```bash
npm install
# atau
pnpm install
```

3. **Setup environment variables**

Copy file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Terus isi sesuai kredensial:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/syncpath"

# Auth
BETTER_AUTH_SECRET="generate-random-string-disini"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

4. **Push schema ke database**

```bash
npx drizzle-kit push
```

5. **Jalankan development server**

```bash
npm run dev
```

6. **Buka browser**

Akses [http://localhost:3000](http://localhost:3000) 

## Kontribusi 🤝

Feel free buat submit PR atau buka issue kalo nemu bug. Semua kontribusi diapresiasi!

## Lisensi

MIT License - bebas dipake dan dimodifikasi sesuka hati.

---

Made with lots of ☕ dan banyak debugging session.
