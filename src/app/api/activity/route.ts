import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const pool = getPool();
  let connection;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    
    connection = await pool.getConnection();
    
    let adjustments;
    if (limitParam) {
      // Sanitize limit to prevent SQL injection
      const limit = Math.max(1, Math.min(100, parseInt(limitParam, 10)));
      // Use query() with LIMIT directly in SQL (safe since limit is sanitized integer)
      adjustments = await connection.query(
        `SELECT * FROM StockAdjustment 
         WHERE userId = ? 
         ORDER BY timestamp DESC 
         LIMIT ${limit}`,
        [session.user.id]
      );
    } else {
      adjustments = await connection.query(
        "SELECT * FROM StockAdjustment WHERE userId = ? ORDER BY timestamp DESC",
        [session.user.id]
      );
    }

    // Transform to match frontend expectations
    const transformedAdjustments = (adjustments[0] as any[]).map((a) => ({
      id: a.id,
      productId: a.productId,
      userId: a.userId,
      type: a.type === "ADD" ? "add" : "remove",
      quantity: a.quantity,
      previousQuantity: a.previousQuantity,
      newQuantity: a.newQuantity,
      timestamp: new Date(a.timestamp),
    }));

    return NextResponse.json({ adjustments: transformedAdjustments }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch adjustments:", error);
    return NextResponse.json(
      { error: "Failed to fetch adjustments" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
