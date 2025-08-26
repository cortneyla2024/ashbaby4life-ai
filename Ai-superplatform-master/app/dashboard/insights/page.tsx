import { Metadata } from "next";
import InsightsFeed from "@/components/dashboard/InsightsFeed";

export const metadata: Metadata = {
  title: "AI Insights - AI Life Companion",
  description: "View your personalized AI-generated wellness insights",
};

export default function InsightsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Wellness Insights
          </h1>
          <p className="text-gray-600">
            Your AI companion analyzes your activity patterns and provides personalized insights to help you thrive.
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <InsightsFeed
            compact={false}
            maxInsights={50}
            showFilters={true}
          />
        </div>

        {/* Information section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How Insights Work</h3>
            <p className="text-sm text-blue-700">
              Your AI companion analyzes your mood, finances, social activity, and habits to identify patterns and opportunities.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">Categories</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Wellness:</strong> Mood trends and mental health</li>
              <li>• <strong>Finance:</strong> Spending patterns and goals</li>
              <li>• <strong>Social:</strong> Community engagement</li>
              <li>• <strong>Growth:</strong> Habits and learning progress</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">Priorities</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• <strong>High:</strong> Important trends to address</li>
              <li>• <strong>Medium:</strong> Notable patterns worth noting</li>
              <li>• <strong>Low:</strong> Gentle reminders and encouragement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
