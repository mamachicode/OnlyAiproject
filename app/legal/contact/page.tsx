export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">Contact Us</h1>

      <p>
        For support, billing questions, compliance inquiries, or legal notices, contact us using the appropriate channel
        below. Please include your account email and any relevant details.
      </p>

      <div className="space-y-2">
        <p className="font-semibold text-lg">Support / Billing</p>
        <p className="text-lg">support@onlyai.com</p>
        <p className="text-sm text-gray-700">Typical response time: 24–48 hours.</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold text-lg">DMCA / Takedown Notices</p>
        <p className="text-lg">dmca@onlyai.com</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold text-lg">Compliance</p>
        <p className="text-lg">compliance@onlyai.com</p>
      </div>

      <p className="text-sm text-gray-600">
        If you are contacting us about a billing dispute, please include the date, amount, and any available transaction
        reference from your payment processor.
      </p>
    </div>
  );
}
