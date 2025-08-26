import { Metadata } from "next";
import APITokenManager from "@/components/settings/APITokenManager";

export const metadata: Metadata = {
  title: "Integrations - AI Life Companion",
  description: "Manage your API tokens and third-party integrations",
};

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Integrations & API Access
          </h1>
          <p className="text-gray-600">
            Manage your API tokens and configure third-party integrations for voice commands and external access.
          </p>
        </div>

        <div className="space-y-8">
          {/* API Token Management */}
          <section>
            <APITokenManager />
          </section>

          {/* Voice Command Documentation */}
          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Voice Command API</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Endpoint</h3>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  POST /api/voice/command
                </code>
              </div>

              <div>
                <h3 className="font-medium mb-2">Authentication</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Include your API token in the Authorization header:
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  Authorization: Bearer YOUR_API_TOKEN
                </code>
              </div>

              <div>
                <h3 className="font-medium mb-2">Request Body</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "transcribedText": "Log my meditation habit for today"
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">Supported Commands</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>CREATE_TRANSACTION:</strong> &quot;Add a $50 expense for groceries&quot;</li>
                  <li>• <strong>LOG_HABIT:</strong> &quot;Log my meditation habit for today&quot;</li>
                  <li>• <strong>CREATE_JOURNAL_ENTRY:</strong> &quot;I had a great day at work today&quot;</li>
                  <li>• <strong>ADD_LEARNING_RESOURCE:</strong> &quot;Add a Python tutorial to my learning resources&quot;</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Response Format</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "message": "Successfully logged 'meditation' for today.",
  "intent": "LOG_HABIT",
  "success": true
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Integration Examples */}
          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Integration Examples</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium">Voice Assistants</h3>
                <p className="text-sm text-gray-600">
                  Use with Alexa, Google Assistant, or Siri to control your life companion through voice commands.
                </p>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    &quot;Alexa, ask my life companion to log my meditation habit&quot;
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Wearables & IoT</h3>
                <p className="text-sm text-gray-600">
                  Connect smartwatches and fitness trackers to automatically log activities and health metrics.
                </p>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-green-800">
                    Automatically log workout sessions and health data from your smartwatch.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Mobile Apps</h3>
                <p className="text-sm text-gray-600">
                  Build custom mobile applications that integrate with your life companion data.
                </p>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-purple-800">
                    Create a custom widget to quickly log habits or transactions.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Automation Tools</h3>
                <p className="text-sm text-gray-600">
                  Use with IFTTT, Zapier, or custom scripts to automate your life companion interactions.
                </p>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-sm text-orange-800">
                    Automatically log expenses when you receive bank notifications.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Security Notice */}
          <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">Security Notice</h2>
            <div className="space-y-3 text-sm text-yellow-700">
              <p>
                <strong>Important:</strong> Your API token provides full access to your account. Keep it secure and never share it publicly.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Store tokens securely in environment variables or secure vaults</li>
                <li>Rotate tokens regularly for enhanced security</li>
                <li>Monitor your voice command logs for suspicious activity</li>
                <li>Revoke tokens immediately if compromised</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
