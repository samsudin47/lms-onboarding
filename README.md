# LMS-ONBOARD (Learning Management System) Platform

Project web aplikasi LMS modern yang dibangun dengan teknologi web terbaru, menyediakan dashboard interaktif untuk berbagai role pengguna seperti Super Admin, Admin PSP, Mentor, Co-Mentor, Karyawan, dan Onboarding.

## Tech Stack

Project ini dibangun menggunakan stack berikut:

- **Build Tool**: `Vite 7`
- **Core UI**: `React 19`
- **Language**: `TypeScript`
- **Routing**: `React Router DOM 7`
- **Styling**:
  - `Tailwind CSS v4`
  - `tailwind-merge` + `clsx` untuk penggabungan class dinamis
  - `class-variance-authority (CVA)` untuk varian komponen
- **Icons**: `Lucide React`
- **UI Components**:
  - Komponen kustom reusable di `src/components/ui`
  - Berbasis primitive UI modern (`radix-ui` dan utilitas `shadcn`)
- **Animations**: `tw-animate-css`
- **Code Quality**:
  - `ESLint`
  - `Prettier` + `prettier-plugin-tailwindcss`

## Panduan Instalasi (Step-by-Step)

Ikuti langkah berikut untuk menjalankan project di komputer lokal Anda:

### 1. Prasyarat

Pastikan sudah menginstall:

- `Node.js` versi **18.17+** (disarankan versi LTS terbaru)
- Package manager: `npm` (default), `yarn`, `pnpm`, atau `bun`

### 2. Clone Repository

Jika project belum ada di komputer Anda:

```bash
git clone https://github.com/username-anda/lms-onboard.git
cd lms-onboard
```

> Jika Anda bekerja dari file lokal/zip, cukup ekstrak lalu masuk ke folder project.

### 3. Install Dependencies

Install semua dependency:

```bash
npm install
```

Alternatif package manager lain:

```bash
yarn
# atau
pnpm install
# atau
bun install
```

### 4. Jalankan Development Server

Jalankan server lokal:

```bash
npm run dev
```

### 5. Buka di Browser

Setelah server berjalan, akses:

```text
http://localhost:5173
```

> Port default Vite adalah `5173` (bisa berbeda jika port sudah terpakai).

## Scripts Penting

- `npm run dev` - Menjalankan development server
- `npm run build` - Build production (`tsc -b && vite build`)
- `npm run preview` - Preview hasil build production
- `npm run lint` - Menjalankan ESLint
- `npm run typecheck` - Validasi TypeScript tanpa emit
- `npm run format` - Format file `ts/tsx` menggunakan Prettier

## Struktur Project

Struktur utama project:

- `src/main.tsx` - Entry point aplikasi
- `src/App.tsx` - Root app component
- `src/router.tsx` - Konfigurasi route utama
- `src/pages` - Halaman per fitur/role (dashboard, onboarding, login, profile, dll)
- `src/layouts` - Layout aplikasi
- `src/components` - Komponen reusable
- `src/components/ui` - Komponen UI dasar (Button, Input, Sidebar, Sheet, dst)
- `src/lib` - Utility functions, data helper, dan konfigurasi fitur
- `src/hooks` - Custom React hooks

## Fitur Utama (Saat Ini)

- **Role-based dashboard** untuk kebutuhan akses berbeda per pengguna
- **Role switcher/access selection** untuk simulasi role saat development/demo
- **Modul onboarding** (class, batch, learning module, evaluasi, feedback, leaderboard, dll)
- **UI modern dan responsif** dengan komponen reusable
- **Navigasi sidebar terstruktur** untuk akses cepat ke fitur LMS
