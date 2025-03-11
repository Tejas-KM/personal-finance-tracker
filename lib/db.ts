import { MongoClient, ObjectId } from "mongodb"
import { cache } from "react"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Use React's cache to prevent multiple connections during a single render
export const getDb = cache(async () => {
  // Skip database connection during build
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "preview") {
    // Return a mock db during build
    return {
      collection: () => ({
        find: () => ({
          sort: () => ({
            limit: () => ({
              toArray: () => Promise.resolve([]),
            }),
            toArray: () => Promise.resolve([]),
          }),
          findOne: () => Promise.resolve(null),
          countDocuments: () => Promise.resolve(0),
        }),
        insertOne: () => Promise.resolve({ insertedId: "mock-id" }),
        updateOne: () => Promise.resolve({ modifiedCount: 1 }),
        deleteOne: () => Promise.resolve({ deletedCount: 1 }),
      }),
    }
  }

  const client = await clientPromise
  return client.db("finance-tracker")
})

export const formatId = (id: string) => new ObjectId(id)

