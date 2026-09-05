import type { Metadata } from 'next'; import './globals.css';
export const metadata:Metadata={title:'AIGate — AI Procurement, Governance & Value Control Plane',description:'Screen AI use cases, route controls and approvals, trace evidence, and quantify value — without a paid API.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
