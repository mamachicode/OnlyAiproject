export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">Contact Us</h1>

      <p>
        OnlyAi is operated by its founding team and committed to maintaining
        high standards of compliance, transparency, and customer support.
        For support, billing questions, compliance inquiries, or legal notices,
        please use the appropriate contact channel below.
      </p>

      <div className="space-y-2">
        <p className="font-semibold text-lg">Support / Billing</p>
        <p className="text-lg">support@onlyai.com</p>
        <p className="text-sm text-gray-700">
          Typical response time: 24–48 hours.
        </p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold text-lg">DMCA / Takedown Notices</p>
        <p className="text-lg">dmca@onlyai.com</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold text-lg">Compliance</p>
        <p className="text-lg">compliance@onlyai.com</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Billing Information</h2>
        <p>
          All subscription billing is processed securely by our authorized
          payment partners. If contacting us about a billing concern, please
          include your account email, transaction date, amount, and any
          available transaction reference.
        </p>
      </section>

      <p className="text-sm text-gray-600">
        We aim to resolve all inquiries promptly and professionally.
      </p>
    </div>
  );
}
