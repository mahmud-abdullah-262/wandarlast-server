require('dotenv').config() 

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI 
console.log(uri, 'uri')


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

    const db = client.db('wandarlast-db')
    const destinationCollection = db.collection('destinations');
    

    app.post('/destination', async (req, res) => {
      const destinationData = req.body;
      const result = await destinationCollection.insertOne(destinationData)
      console.log(result, 'data on server')
      res.send(result)

    })

    app.get('/destination', async (req, res) => {
     const cursor = destinationCollection.find() 
      const result = await cursor.toArray()
      res.send(result) 
    })

     app.get('/destination/:id', async (req, res) => {
     const {id} = req.params;
      const result = await destinationCollection.findOne({_id: new ObjectId(id)})
      res.send(result) 
    })


    app.patch('/destination/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id, 'id')
      const query = {_id: new ObjectId(id)}
      const modifiedDestination = req.body;
      const updatedDocument = {
          $set : {
            destinationName: modifiedDestination.destinationName,
            country: modifiedDestination.country,
            category: modifiedDestination.category,
            price: modifiedDestination.price,
            duration: modifiedDestination.duration,
            departureDate: modifiedDestination.departureDate,
            imageUrl: modifiedDestination.imageUrl,
            description: modifiedDestination.description,
          
          }
      }
      const result = await destinationCollection.updateOne(query, updatedDocument);
      console.log(result, 'modified destination')
      res.send(result)
    })

       app.delete('/destination/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id) }
      const result = await destinationCollection.deleteOne(query)
      res.json(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, ()=> {
  console.log(`WanderLast server is running in ${port}`)
})