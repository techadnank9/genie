import "./globals.css";

export const metadata = {
  title: "Genie",
  description: "Hackathon MVP for AI-powered business calling and quote comparison.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
