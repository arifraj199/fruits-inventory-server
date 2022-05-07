const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

//necessary middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nfrv0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const fruitCollection = client.db("fruitsInventory").collection("fruit");

    //AUTH API
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    //get data
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = fruitCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get inventory id
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitCollection.findOne(query);
      res.send(result);
    });

    //get api with filter email
    app.get("/myitem", verifyJWT, async (req, res) => {
      const decodeEmail = req.decoded.email;
      const email = req.query.email;

      if (email === decodeEmail) {
        const query = { email: email };
        const cursor = fruitCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //delete api
    app.delete("/myitem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitCollection.deleteOne(query);
      res.send(result);
    });

    //post data
    app.post("/inventory", async (req, res) => {
      const newItem = req.body;
      const result = await fruitCollection.insertOne(newItem);
      res.send(result);
    });

    //update data for quantity
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updateQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateQuantity.quantity,
        },
      };
      const result = await fruitCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //delete item
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("fruits server is running");
});

app.listen(port, () => {
  console.log("server is connected on port", port);
});
