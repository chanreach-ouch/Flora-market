import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Flora Market · ផ្សាររុក្ខជាតិ",
  description: "Cambodia's trusted plant marketplace — connecting verified nurseries with plant lovers. Fixed prices, honest listings, no negotiation.",
  keywords: ["Flora Market", "ផ្សាររុក្ខជាតិ", "Cambodia", "plants", "nursery", "marketplace", "Phnom Penh"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
  },
  openGraph: {
    title: "Flora Market · ផ្សាររុក្ខជាតិ",
    description: "Cambodia's trusted plant marketplace",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1a3a2a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Prevent FOUC: apply dark mode before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('flora-market-state');
                  if (raw) {
                    var state = JSON.parse(raw);
                    if (state.darkMode) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
