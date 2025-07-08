const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    const database = client.db("ecommerceDB");
    jobsCollection = database.collection("products");

    // Root route
    app.get("/", (req, res) => {
      res.send("Job is falling from the sky 🌤️");
    });

    // Get all products
    app.get("/products", async (req, res) => {
      try {
        const products = await jobsCollection.find({}).toArray();
        res.status(200).json(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        res.status(500).json({ message: "Failed to fetch products" });
      }
    });

    // Get single product by ID
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      try {
        const product = await jobsCollection.findOne({ _id: new ObjectId(id) });

        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        res.status(500).json({ message: "Failed to fetch product" });
      }
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
