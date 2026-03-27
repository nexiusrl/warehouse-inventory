import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const products = await query<any[]>(
      "SELECT * FROM Product WHERE id = ?",
      [id]
    );

    if (products.length === 0 || products[0].userId !== session.user.id) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const product = {
      ...products[0],
      createdAt: new Date(products[0].createdAt),
      updatedAt: new Date(products[0].updatedAt),
    };

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verify product exists and belongs to user
    const existingProducts = await query<any[]>(
      "SELECT * FROM Product WHERE id = ? AND userId = ?",
      [id, session.user.id]
    );

    if (existingProducts.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (["sku", "name", "category", "description", "quantity"].includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length > 0) {
      values.push(id);
      await query(
        `UPDATE Product SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }

    const updatedProducts = await query<any[]>(
      "SELECT * FROM Product WHERE id = ?",
      [id]
    );

    const product = {
      ...updatedProducts[0],
      createdAt: new Date(updatedProducts[0].createdAt),
      updatedAt: new Date(updatedProducts[0].updatedAt),
    };

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify product exists and belongs to user
    const existingProducts = await query<any[]>(
      "SELECT id FROM Product WHERE id = ? AND userId = ?",
      [id, session.user.id]
    );

    if (existingProducts.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await query("DELETE FROM Product WHERE id = ?", [id]);

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
