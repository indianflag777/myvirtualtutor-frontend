import "./globals.css";

export const metadata = {
  title: "MyVirtualTutor Live",
  description: "Live AI Math Tutor (Voice + Chat), Grades 3–8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
