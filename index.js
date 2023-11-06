const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Library Management (CRUD And JWT) SERVER is running!");
});

app.listen(port, () => {
  console.log(`SERVER running on port: ${port}`);
});

// MIDDLEWARE
//To Send Token From Server Cross Origin Setup In Cors Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Starts Here

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

console.log(process.env.DB_USER, process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m38robg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // BOOK CATEGORIES API
    const bookCategoriesCollection = client
      .db("bookByteLibraryDB")
      .collection("bookCategories");

    app.get("/bookCategories", async (req, res) => {
      const cursor = bookCategoriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // BOOKS API TO LOAD ALL BOOKS
    const bookCollection = client
      .db("bookByteLibraryDB")
      .collection("allBooks");
    // app.get("/allBooks", async (req, res) => {
    //   const cursor = bookCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // ALL BOOKS API FOR PAGINATION
    app.get("/allBooks", async (req, res) => {
      const books = req.query;
      // console.log("Pagination Products:", products);
      // GET currentPage And itemsPerPage From Client Side
      const page = parseInt(books.page);
      const size = parseInt(books.size);

      const cursor = bookCollection
        .find()
        .skip(page * size) //SET HOW MANY WILL SKIP
        .limit(size); //SET HOW MANY WILL RENDER IN A PAGE
      const result = await cursor.toArray();
      res.send(result);
    });

    // TOTAL BOOKS COUNT
    app.get("/booksCount", async (req, res) => {
      const count = await bookCollection.estimatedDocumentCount();
      console.log("Total Books= ", count);
      res.send({ count });
    });

    // API TO ADD A NEW BOOK
    app.post("/allBooks", async (req, res) => {
      const newBook = req.body;
      console.log(newBook);
      const result = await bookCollection.insertOne(newBook);
      res.send(result);
    });

    // API TO UPDATE A PRODUCT

    app.get("/allBooks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query);
      res.send(result);
    });

    app.put("/allBooks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBook = req.body;
      const book = {
        $set: {
          image: updatedBook.image,
          name: updatedBook.name,
          category: updatedBook.category,
          author: updatedBook.author,
          quantity: updatedBook.quantity,
          description: updatedBook.description,
          ratings: updatedBook.ratings,
        },
      };

      const result = await bookCollection.updateOne(filter, book, options);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
