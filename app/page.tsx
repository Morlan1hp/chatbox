import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">欢迎来到我们的ChatAI应用</h1>
        <p className="text-xl mb-8">点击下面的按钮开始使用吧！</p>
        <Link href="/chat" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
          开始使用
        </Link>
      </div>
    </main>
  );
}
