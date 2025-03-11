"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

import { getDb } from "@/lib/db"

export async function createBudget(data: {
  amount: number
  categoryId: string
  notes?: string
}) {
  const db = await getDb()

  // Check if a budget already exists for this category
  const existingBudget = await db.collection("budgets").findOne({
    categoryId: data.categoryId,
  })

  if (existingBudget) {
    throw new Error("A budget for this category already exists")
  }

  await db.collection("budgets").insertOne({
    ...data,
    createdAt: new Date(),
  })

  revalidatePath("/budgets")
  revalidatePath("/dashboard")
}

export async function updateBudget(data: {
  id: string
  amount: number
  categoryId: string
  notes?: string
}) {
  const { id, ...updateData } = data
  const db = await getDb()

  // Check if a budget already exists for this category (excluding the current one)
  if (data.categoryId !== updateData.categoryId) {
    const existingBudget = await db.collection("budgets").findOne({
      _id: { $ne: new ObjectId(id) },
      categoryId: data.categoryId,
    })

    if (existingBudget) {
      throw new Error("A budget for this category already exists")
    }
  }

  await db.collection("budgets").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
  )

  revalidatePath("/budgets")
  revalidatePath("/dashboard")
}

export async function deleteBudget(formData: FormData) {
  const id = formData.get("id") as string

  const db = await getDb()
  await db.collection("budgets").deleteOne({ _id: new ObjectId(id) })

  revalidatePath("/budgets")
  revalidatePath("/dashboard")
}

