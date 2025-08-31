export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
          {children}
        </div>
      </body>
    </html>
  );
}
