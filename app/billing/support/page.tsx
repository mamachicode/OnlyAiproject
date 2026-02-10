export default function BillingSupportPage() {
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Subscription</h1>

      <p>
        Adult subscriptions on OnlyAI are processed securely through CCBill.
      </p>

      <p>
        To cancel a subscription, update billing information, or resolve payment issues,
        please visit the official CCBill consumer support portal:
      </p>

      <a
        href="https://support.ccbill.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline font-medium"
      >
        https://support.ccbill.com
      </a>

      <p className="text-sm text-gray-600">
        If you require additional assistance, please contact our support team.
      </p>
    </div>
  );
}
