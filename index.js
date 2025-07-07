const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dkwhsex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let jobsCollection;

async function run() {
  try {
    await client.connect();
    const database = client.db("jobDB");
    jobsCollection = database.collection("jobs");

    console.log("Connected to MongoDB");

    // Example route to fetch jobs
    app.get("/jobs", async (req, res) => {
      const jobs = await jobsCollection.find().toArray();
      res.send(jobs);
    });

    // Root route
    app.get("/", (req, res) => {
      res.send("Job is falling from the sky 🌤️");
    });

    // Start server after DB connection is confirmed
    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);
