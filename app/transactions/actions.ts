"use server"

import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

import { getDb } from "@/lib/db"

export async function createTransaction(data: {
  description: string
  amount: number
  date: Date
  categoryId?: string
  notes?: string
}) {
  const db = await getDb()

  const transactionData = {
    ...data,
    createdAt: new Date(),
  }

  // Convert categoryId to ObjectId if it exists
  if (data.categoryId) {
    transactionData.categoryId = data.categoryId
  }

  await db.collection("transactions").insertOne(transactionData)

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
}

export async function updateTransaction(data: {
  id: string
  description: string
  amount: number
  date: Date
  categoryId?: string
  notes?: string
}) {
  const { id, ...updateData } = data
  const db = await getDb()

  const transactionData = {
    ...updateData,
    updatedAt: new Date(),
  }

  // Convert categoryId to ObjectId if it exists
  if (data.categoryId) {
    transactionData.categoryId = data.categoryId
  } else {
    // If categoryId is empty string or undefined, remove it from the document
    transactionData.categoryId = null
  }

  await db.collection("transactions").updateOne({ _id: new ObjectId(id) }, { $set: transactionData })

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
}

export async function deleteTransaction(formData: FormData) {
  const id = formData.get("id") as string

  const db = await getDb()
  await db.collection("transactions").deleteOne({ _id: new ObjectId(id) })

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
}

