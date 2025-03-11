import { Db, MongoClient } from 'mongodb'

let uri = "mongodb://israeloduguwa:adeboyega@zororo-cluster-shard-00-00.ruky4.mongodb.net:27017,zororo-cluster-shard-00-01.ruky4.mongodb.net:27017,zororo-cluster-shard-00-02.ruky4.mongodb.net:27017/?ssl=true&replicaSet=atlas-wkxcm3-shard-0&authSource=admin&retryWrites=true&w=majority";
let dbName ="kinshealth";

// mongodb+srv://israeloduguwa:adeboyega@zororo-cluster.ruky4.mongodb.net/kinshealth
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

if (!dbName) {
  throw new Error(
    'Please define the MONGODB_DB environment variable inside .env.local'
  )
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(uri, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })

  const db = await client.db(dbName)

  cachedClient = client
  cachedDb = db

  return { client, db }
}