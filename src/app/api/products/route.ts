import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";
import { productSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const products = await query<any[]>(
      "SELECT * FROM Product WHERE userId = ? ORDER BY createdAt DESC",
      [session.user.id]
    );

    // Convert date strings to Date objects
    const formattedProducts = products.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check for duplicate SKU
    const existingProducts = await query<any[]>(
      "SELECT id FROM Product WHERE userId = ? AND sku = ?",
      [session.user.id, validatedData.sku]
    );

    if (existingProducts.length > 0) {
      return NextResponse.json(
        { error: "A product with this SKU already exists" },
        { status: 400 }
      );
    }

    const productId = crypto.randomUUID();
    await query(
      `INSERT INTO Product (id, sku, name, category, description, quantity, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        validatedData.sku,
        validatedData.name,
        validatedData.category,
        validatedData.description || null,
        validatedData.quantity,
        session.user.id,
      ]
    );

    const newProduct = {
      id: productId,
      sku: validatedData.sku,
      name: validatedData.name,
      category: validatedData.category,
      description: validatedData.description || null,
      quantity: validatedData.quantity,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
