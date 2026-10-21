import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'FlowBridge AI', description: 'Synthetic Excel-to-Web automation demo' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
