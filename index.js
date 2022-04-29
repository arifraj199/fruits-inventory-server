const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();


//necessary middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nfrv0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const fruitCollection = client.db("fruitsInventory").collection("fruit");

        //get data
        app.get('/inventory',async(req,res)=>{
            const query = {};
            const cursor = fruitCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
    }
    finally{}
}

run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('fruits server is running')
});

app.listen(port,()=>{
    console.log('server is connected on port',port);
})