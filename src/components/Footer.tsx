export default function Footer() {
  return (
    <footer className="w-full border-t mt-16 py-8 bg-white/70 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6">

        <div>
          <p className="font-semibold text-lg">OnlyAI</p>
          <p className="text-sm text-gray-600">AI-Powered Creator Platform</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <a href="/legal/terms" className="hover:text-black">Terms</a>
          <a href="/legal/privacy" className="hover:text-black">Privacy</a>
          <a href="/legal/refund" className="hover:text-black">Refunds</a>
          <a href="/legal/2257" className="hover:text-black">2257 Compliance</a>
          <a href="/legal/contact" className="hover:text-black">Contact</a>
        </div>
      </div>
    </footer>
  );
}

