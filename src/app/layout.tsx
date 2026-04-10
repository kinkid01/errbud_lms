import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import ChakraUiProvider from '@/components/providers/ChakraUiProvider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'errbudE-Learning Dashboard',
  description: 'Professional e-learning platform for course management and student progress tracking',
  keywords: ['e-learning', 'education', 'courses', 'dashboard', 'learning management'],
  authors: [{ name: 'errbud' }],
  openGraph: {
    title: 'errbudE-Learning Dashboard',
    description: 'Professional e-learning platform for course management and student progress tracking',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans dark:bg-gray-900" suppressHydrationWarning={true}>
        <ThemeProvider>
          <ChakraUiProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ChakraUiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
