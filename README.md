# MIT ClubHub

The premier event management and student networking platform for MIT Manipal. Built with a stunning "Deep Dark" OLED glassmorphic design system to provide an elite, high-contrast user experience.

![ClubHub Banner](https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop) *(Demo Background)*

## 🚀 Tech Stack

*   **Framework**: [Next.js 16.2](https://nextjs.org/) (Turbopack)
*   **Styling**: Tailwind CSS (Deep Dark Theme)
*   **Database & Auth**: [Supabase](https://supabase.com/)
*   **Icons**: Lucide React
*   **Avatars**: DiceBear Identicon API

## 🛠️ How to Clone and Run Locally

Follow these steps to set up the development environment on your local machine.

### 1. Clone the Repository

Open your terminal and clone the repository using Git:

```bash
git clone https://github.com/yashkotturi/club-events-hub.git
cd club-events-hub
```

### 2. Install Dependencies

You can use `npm`, `yarn`, `pnpm`, or `bun`. We recommend standard `npm`:

```bash
npm install
```

### 3. Configure Environment Variables

The project relies on Supabase for data fetching and authentication. You need to link it to the database.

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Open the file and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*(Reach out to the project administrator if you need access to the development database).*

### 4. Run the Development Server

Start the Turbopack-powered Next.js development server:

```bash
npm run dev
```

### 5. Access the Platform

Open your browser and navigate to [http://localhost:3000](http://localhost:3000). You should see the glassmorphic landing page!

---

## 🔒 Directory Structure Overview

*   `src/app/`: Next.js App Router endpoints (Landing, Auth, Clubs, Events, Admin Dashboard)
*   `src/components/`: Reusable UI components (Navbar, EventTimelineCard, Marquee, Glass Cards)
*   `src/lib/`: Core utilities and API clients (Supabase instantiation)

## 🤝 Contributing
Ensure all UI components adhere strictly to the established absolute-black and emerald/indigo glassmorphism aesthetic (`bg-black`, `bg-white/[0.02]`, and high-contrast tokens).
