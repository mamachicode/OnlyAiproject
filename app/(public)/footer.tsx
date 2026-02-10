import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t mt-16 p-6 text-sm text-gray-600">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">

        <div>
          <h3 className="font-semibold mb-2">Legal</h3>
          <ul className="space-y-1">
            <li><Link href="/legal/terms">Terms of Service</Link></li>
            <li><Link href="/legal/privacy">Privacy Policy</Link></li>
            <li><Link href="/legal/refund">Refund Policy</Link></li>
            <li><Link href="/legal/2257">2257 Notice</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Compliance</h3>
          <ul className="space-y-1">
            <li><Link href="/dmca">DMCA</Link></li>
            <li><Link href="/age">18+ Age Disclaimer</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Company</h3>
          <ul className="space-y-1">
            <li><Link href="/legal/contact">Contact</Link></li>
            <li><Link href="/billing/support">Manage Subscription</Link></li>
            <li>Email: support@onlyai.com</li>
          </ul>
        </div>

      </div>

      <div className="text-center mt-6 text-xs text-gray-500">
        © 2025 OnlyAI. All rights reserved.
      </div>
    </footer>
  );
}
