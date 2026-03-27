import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all products for the user
    const products = await query<any[]>(
      "SELECT quantity FROM Product WHERE userId = ?",
      [session.user.id]
    );

    const totalSkus = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const inStock = products.filter((p) => p.quantity > 10).length;
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
    const outOfStock = products.filter((p) => !p.quantity || p.quantity === 0).length;

    return NextResponse.json({
      metrics: {
        totalSkus,
        totalQuantity,
        inStock,
        lowStock,
        outOfStock,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
