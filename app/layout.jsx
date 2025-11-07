import { AuthProvider } from '@/app/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin Panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
