import { AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export function DemoModeWarning() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if running in demo mode by making a health check request
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        if (data.demoMode) {
          setIsDemoMode(true);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, []);

  if (!isDemoMode || isDismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Running without database. Data will not persist between sessions.
              {' '}
              <a 
                href="https://github.com/mbark223/bountyboard#quick-start" 
                className="underline hover:text-yellow-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                Set up a database
              </a>
            </p>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-yellow-600 hover:text-yellow-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}