"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

import { getDb } from "@/lib/db"

export async function createCategory(data: {
  name: string
  description?: string
  color: string
}) {
  const db = await getDb()

  await db.collection("categories").insertOne({
    ...data,
    createdAt: new Date(),
  })

  revalidatePath("/categories")
  revalidatePath("/dashboard")
  revalidatePath("/transactions")
}

export async function updateCategory(data: {
  id: string
  name: string
  description?: string
  color: string
}) {
  const { id, ...updateData } = data
  const db = await getDb()

  await db.collection("categories").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
  )

  revalidatePath("/categories")
  revalidatePath("/dashboard")
  revalidatePath("/transactions")
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id") as string

  const db = await getDb()

  // First check if there are any transactions using this category
  const transactionsWithCategory = await db.collection("transactions").countDocuments({
    categoryId: id,
  })

  if (transactionsWithCategory > 0) {
    // If there are transactions, we should handle this gracefully
    // For now, we'll just not delete the category
    throw new Error("Cannot delete category with associated transactions")
  }

  await db.collection("categories").deleteOne({ _id: new ObjectId(id) })

  revalidatePath("/categories")
  revalidatePath("/dashboard")
  revalidatePath("/transactions")
}

