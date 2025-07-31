"use client";

import { useState } from "react";
import TipTapEditor from "@/components/blog/editor/TipTapEditorSSR";

export default function TestEditorPage() {
  const [content, setContent] = useState("<p>This is a test paragraph.</p><h1>This is a test heading</h1>");
  const [testContent, setTestContent] = useState("");

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Editor Test Page</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Content:</label>
        <textarea
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          className="w-full h-32 p-2 bg-gray-800 border border-gray-600 rounded text-white"
          placeholder="Enter HTML content to test..."
        />
        <button
          onClick={() => setContent(testContent)}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Load Content
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Content:</h2>
        <div className="p-4 bg-gray-800 rounded text-sm">
          {content}
        </div>
      </div>

      <div className="border border-gray-600 rounded">
        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Test editor..."
        />
      </div>
    </div>
  );
}