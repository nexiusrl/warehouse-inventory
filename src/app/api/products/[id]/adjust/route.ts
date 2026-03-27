import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPool } from "@/lib/db";
import { stockAdjustmentSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: productId } = await params;
    const body = await request.json();
    const validatedData = stockAdjustmentSchema.parse(body);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verify the product exists and belongs to the user
    const [products] = await connection.execute<any[]>(
      "SELECT * FROM Product WHERE id = ? AND userId = ?",
      [productId, session.user.id]
    );

    if (products.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const product = products[0];

    // Validate removal doesn't go negative
    if (validatedData.type === "remove" && validatedData.quantity > product.quantity) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Insufficient stock for this removal" },
        { status: 400 }
      );
    }

    // Calculate new quantity
    const newQuantity = validatedData.type === "add"
      ? product.quantity + validatedData.quantity
      : product.quantity - validatedData.quantity;

    // Update product quantity
    await connection.execute(
      "UPDATE Product SET quantity = ? WHERE id = ?",
      [newQuantity, productId]
    );

    // Create stock adjustment record
    const adjustmentId = crypto.randomUUID();
    await connection.execute(
      `INSERT INTO StockAdjustment (id, productId, userId, type, quantity, previousQuantity, newQuantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        adjustmentId,
        productId,
        session.user.id,
        validatedData.type.toUpperCase(),
        validatedData.quantity,
        product.quantity,
        newQuantity,
      ]
    );

    await connection.commit();

    const updatedProduct = {
      ...product,
      quantity: newQuantity,
      updatedAt: new Date(),
    };

    const adjustment = {
      id: adjustmentId,
      productId,
      userId: session.user.id,
      type: validatedData.type.toLowerCase() as "add" | "remove",
      quantity: validatedData.quantity,
      previousQuantity: product.quantity,
      newQuantity,
      timestamp: new Date(),
    };

    return NextResponse.json({
      product: updatedProduct,
      adjustment,
    }, { status: 200 });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Failed to adjust stock:", error);
    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
