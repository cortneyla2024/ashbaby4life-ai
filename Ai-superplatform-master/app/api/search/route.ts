import { NextRequest, NextResponse } from "next/server";
import { SearchQuery } from "@/lib/search/search-query";
import { AuthService } from "@/lib/auth";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().min(1).max(50).optional().default(10),
});

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await AuthService.authenticate(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const searchData = { query, limit };
    SearchSchema.parse(searchData);

    const searchQuery = new SearchQuery();
    await searchQuery.buildIndex();
    const results = await searchQuery.search(query, limit);

    return NextResponse.json({
      success: true,
      results,
      query,
      total: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid search parameters" },
        { status: 400 }
      );
    }

    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
