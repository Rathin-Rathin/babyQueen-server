const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()
app.use(cors());
app.use(express.json());
//MongoDB

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.z5uza0f.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const productsCollection = client.db('babyQueen').collection('products');
        const indexKey = { toyName: 1 }
        const indexOption = { name: 'toyName' };

        const result = await productsCollection.createIndex(indexKey, indexOption);

        app.get('/dollSearchByName/:name', async (req, res) => {
            const dollName = req.params.name;
            const result = await productsCollection.find({
              $or:  [{ toyName: { $regex: dollName, $options: "i" } }],
            }).toArray();
            res.send(result);
        })

        app.post('/addToys', async (req, res) => {
            const body = req.body;
            const result = await productsCollection.insertOne(body);
            res.send(result);
        })

      

        app.get('/allData', async (req, res) => {
            const allData =await productsCollection.find().toArray();
            res.send(allData);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('babyQueen server running');
})
app.listen(port, () => {
    console.log('babyQueen server is running on the port', port);
})