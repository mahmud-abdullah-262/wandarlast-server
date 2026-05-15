require('dotenv').config() 

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
const uri = process.env.MONGODB_URI 
console.log(uri, 'uri')


app.use(cors())
app.use(express.json())
app.get( '/', (req, res) => {
  res.send('WanderLast server is running')
 
})
const JWKS = createRemoteJWKSet(
  new URL('http://localhost:3000/api/auth/jwks') // এখানে ডেপ্লয় লিঙ্ক দিতে হবে
)
const verifyToken = async (req, res, next) => {
  // হেডার নিয়ে আসা
      const authHeader = req.headers.authorization;
      // যদি হেডার না পায় তাহলে এরর দেবে
     if(!authHeader){
      res.status(401).json({message: 'unauthorized'})
     }  
    //  হেডারের ভেতরে টোকেনটা নিয়ে আসা এবং Bearer থেকে আলাদা করা। যদি না থাকে তাহলে এরর দেয়া। যদি টোকেন থাকে তাহলে পরের অপারেশনে যেতে দেয়া।
     const token = authHeader.split(' ')[1]
   if(!token){
      res.status(401).json({message: 'unauthorized'})
     } 
     next()
    //  ভেরিফিকেশন করা। যদি না থাকে তাহলে এরর দেয়া।
     try{
      const {payload} = await jwtVerify(token, JWKS);
      console.log(payload, 'payload') // এটা দেখা গেলে ভেরিফিকেশন সম্পন্ন হবে
      next()
     } catch(error){
      res.status(403).json({message: 'forbidden'})
     }
     

     
     }

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
    const bookingCollection = db.collection('bookings')

    // ডেস্টিনেশন ডাটা যোগ করা
    app.post('/destination', async (req, res) => {
      const destinationData = req.body;
      const result = await destinationCollection.insertOne(destinationData)
      console.log(result, 'data on server')
      res.send(result)

    })

    // ডেস্টিনেশন ডাটা ইউআইতে দেখানো
    app.get('/destination', async (req, res) => {
     const cursor = destinationCollection.find() 
      const result = await cursor.toArray()
      res.send(result) 
    })

    // ডেস্টিনেশন ডিটেইলস দেখা
     app.get('/destination/:id', verifyToken,  async (req, res) => {
     const {id} = req.params;
      const result = await destinationCollection.findOne({_id: new ObjectId(id)})
      res.send(result) 
    })

    // ডেস্টিনেশন ডাটা এডিট করা
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

    // ডেস্টিনেশন ডাটা ডিলিট করা
       app.delete('/destination/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id) }
      const result = await destinationCollection.deleteOne(query)
      res.json(result)
    })

    // বুকিং ডাটা যোগ করা
      app.post('/booking', async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData)
      console.log(result, 'data on server')
      res.json(result)

    })

     // বুকিং ডাটা দেখা দেখা, আইডি দিয়ে ফিল্টার্ড
     app.get('/booking/:userId', async (req, res) => {
     const {userId} = req.params;
      const result = await bookingCollection.find({userId : userId}).toArray()
      res.json(result) 
    })

      // বুকিং ডাটা ডিলিট করা
       app.delete('/booking/:userId', async (req, res) => {
      const {userId} = req.params;
      const query = {_id: new ObjectId(userId) }
      const result = await bookingCollection.deleteOne(query)
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