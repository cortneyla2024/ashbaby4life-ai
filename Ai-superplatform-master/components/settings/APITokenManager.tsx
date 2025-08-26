"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface APITokenResponse {
  message: string;
  token?: string;
  warning?: string;
}

export default function APITokenManager() {
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [generatedToken, setGeneratedToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Check if user has an existing token
  useEffect(() => {
    checkTokenStatus();
  }, []);

  const checkTokenStatus = async() => {
    try {
      const response = await fetch("/api/settings/token", {
        method: "HEAD",
      });
      setHasToken(response.ok);
    } catch (error) {
      console.error("Error checking token status:", error);
    }
  };

  const generateToken = async() => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: APITokenResponse = await response.json();

      if (response.ok) {
        setGeneratedToken(data.token || "");
        setHasToken(true);
        setMessage({
          type: "success",
          text: data.message,
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to generate token",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to generate token. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeToken = async() => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/token", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setHasToken(false);
        setGeneratedToken("");
        setMessage({
          type: "success",
          text: data.message,
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to revoke token",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to revoke token. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = async() => {
    if (generatedToken) {
      try {
        await navigator.clipboard.writeText(generatedToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy token:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Token Management
        </CardTitle>
        <CardDescription>
          Generate a secure API token to enable voice commands and third-party integrations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Token Status:</span>
            {hasToken ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
        </div>

        {/* Generated Token Display */}
        {generatedToken && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">
                Save this token securely - it won&apos;t be shown again!
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                value={generatedToken}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={copyToken}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!hasToken ? (
            <Button
              onClick={generateToken}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Generating..." : "Generate API Token"}
            </Button>
          ) : (
            <Button
              onClick={revokeToken}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? "Revoking..." : "Revoke Token"}
            </Button>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : message.type === "warning"
              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <div className="flex items-center gap-2">
              {message.type === "success" && <CheckCircle className="h-4 w-4" />}
              {message.type === "warning" && <AlertTriangle className="h-4 w-4" />}
              {message.type === "error" && <XCircle className="h-4 w-4" />}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">How to use your API token:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Include it in the Authorization header: <code className="bg-gray-200 px-1 rounded">Bearer YOUR_TOKEN</code></p>
            <p>• Use it with voice assistants and third-party integrations</p>
            <p>• Keep it secure - anyone with this token can access your account</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
