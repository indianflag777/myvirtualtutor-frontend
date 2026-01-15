export const metadata = {
  title: "MyVirtualTutor Live",
  description: "Live AI Math Tutor (Voice + Chat), Grades 3–8"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, Arial" }}>
        {children}
      </body>
    </html>
  );
}
