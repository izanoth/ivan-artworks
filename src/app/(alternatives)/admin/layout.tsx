import "@/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-100 flex items-center justify-center">
        <div className="w-full bg-white p-6">
          {children}
        </div>
      </body>
    </html>
  );
}
