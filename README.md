This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment on Vercel

To deploy the Medora Hospital Dashboard on Vercel:

1.  **Connect to GitHub**: Push your code to a GitHub repository and import it into Vercel.
2.  **Configure Environment Variables**:
    *   Go to Project Settings > Environment Variables.
    *   Add `NEXT_PUBLIC_API_URL` and set its value to `/api/proxy`.
3.  **Deploy**: Vercel will automatically detect the Next.js framework and use `npm run build` to create the production bundle.

The application uses a proxy rewrite (configured in `next.config.ts`) to communicate with the backend at Render. Setting `NEXT_PUBLIC_API_URL=/api/proxy` ensures that API calls are correctly routed through the Vercel edge.

