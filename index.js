const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dkwhsex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
      res.send("Backend server is running 🎉");
    });

    // Get all products
    app.get("/products", async (req, res) => {
      try {
        const products = await jobsCollection.find({}).toArray();
        res.status(200).json(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Get product by ID
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
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Add product
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const requiredFields = ["name", "price", "image", "category", "description"];

      const missingFields = requiredFields.filter((field) => !newProduct[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing fields: ${missingFields.join(", ")}`,
        });
      }

      try {
        const result = await jobsCollection.insertOne(newProduct);
        res.status(201).json({
          message: "Product added",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

run().catch(console.dir);
