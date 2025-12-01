export default function Footer() {
  return (
    <footer className="border-t mt-20 py-10 text-center text-sm text-gray-500 space-y-2">
      <p>© ${new Date().getFullYear()} OnlyAI — All rights reserved.</p>
      <div className="flex justify-center gap-6">
        <a href="/terms" className="hover:underline">Terms of Service</a>
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        <a href="/refund" className="hover:underline">Refund Policy</a>
        <a href="/2257" className="hover:underline">2257 Compliance</a>
        <a href="/contact" className="hover:underline">Contact</a>
      </div>
    </footer>
  );
}
