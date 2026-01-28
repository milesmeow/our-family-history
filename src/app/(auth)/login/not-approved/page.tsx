import Link from "next/link";
import { ShieldX, Heart } from "lucide-react";

export default function NotApprovedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <ShieldX className="w-8 h-8 text-amber-600" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invite Required
          </h1>
          <p className="text-gray-600 mb-6">
            This family history app is private. You&apos;ll need an invitation from a
            family member to join.
          </p>

          {/* Explanation box */}
          <div className="bg-amber-50 rounded-lg p-4 text-left text-sm text-gray-700 mb-6">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Why do we require invitations?</p>
                <p className="text-gray-600">
                  Family stories and memories are precious. We keep this space
                  private to ensure only family members can access and contribute
                  to our shared history.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
            >
              Try a different email
            </Link>
            <p className="text-sm text-gray-500">
              Already have an invitation link?{" "}
              <span className="text-amber-600">Check your email</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Contact a family member to request an invitation
        </p>
      </div>
    </div>
  );
}
