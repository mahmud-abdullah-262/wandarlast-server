require('dotenv').config() 

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;


app.use(cors())
app.use(express.json())
app.get( '/', (req, res) => {
  res.send('WanderLast server is running')
 
})

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port, ()=> {
  console.log(`WanderLast server is running in ${port}`)
})