import type { Metadata } from 'next';
import { Fira_Code, JetBrains_Mono } from 'next/font/google';
import { LanguageProvider } from '../components/LanguageProvider';
import './globals.css';

// 配置Google Fonts
const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-fira-code',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JS Mitata Benchmark | JS Mitata 性能测试',
  description: 'Professional JavaScript performance benchmarking platform. Test, compare and optimize your JS code performance with real-time analysis, detailed metrics and visual charts. 专业的JavaScript性能基准测试平台，实时分析代码性能。',
  keywords: [
    'JavaScript performance',
    'benchmark tool',
    'JS performance test',
    'code optimization',
    'performance analysis',
    'JavaScript基准测试',
    '性能测试工具',
    'JS性能优化',
    '代码性能分析',
    'mitata',
    'performance comparison',
    'JavaScript速度测试',
    'web performance',
    'frontend optimization'
  ],
  authors: [{ name: 'D-Sketon', url: 'https://github.com/D-Sketon' }],
  creator: 'D-Sketon'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={`${firaCode.variable} ${jetBrainsMono.variable}`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
} 