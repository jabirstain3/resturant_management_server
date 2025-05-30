require( 'dotenv' ).config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require( 'mongodb' );

const app = express()
const port = process.env.PORT || 5000;

// Middelware
app.use( cors() );
app.use( express.json() );

const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_USER_PASS }@assignments.vbbuj.mongodb.net/?retryWrites=true&w=majority&appName=assignments`

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const database = client.db( 'resturant_management' );
        const productCollection = database.collection( 'items' );
        const orderCollection = database.collection( 'orders' );

        app.post('/jwt', async ( req, res ) => {
            const user =req.body;
            const accessToken = jwt.sign(user, "sekhjlhfs521554fgohsdfjhdfyhf2598wihfbygvgfliYgksvHVKkjhdnvyrDHdghdFbcrate", {expiresIn: '1h'});
            res.send(accessToken);
        })



        // All products
        app.get('/items', async ( req, res ) =>{
            const products = productCollection.find();
            const result = await products.toArray();
            // console.log(result);
            res.send( result )
        })

        // Top products
        app.get("/items/bestseller", async (req, res) =>{
            const products = productCollection.aggregate([
                { $sort : { sold : -1 }}, 
                { $limit: 6 }
            ])
            const result = await products.toArray();
            // console.log(result);
            res.send( result )
        })

        // Create product
        app.post('/items', async ( req, res ) =>{
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct)
            // console.log(result);
            res.send( result )
        })

        // Product by Id
        app.get('/items/:id', async ( req, res ) =>{
            const id = req.params.id;
            const result = await productCollection.findOne({ _id: new ObjectId(id) });
            // console.log(result);
            res.send( result )
        })

        // Update an item
        app.patch('/items/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const result = await productCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            res.send(result);
        });

        // Delete an item
        app.delete('/Items/:id', async ( req, res ) =>{
            const id = req.params.id;
            const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
            // console.log(result);
            res.send( result )
        })

        // items added by user
        app.get('/:email/items', async ( req, res ) =>{
            const email = req.params.email;
            const result = await productCollection.find({ usersEmail: email }).toArray();
            // console.log(result);
            res.send( result )
        })



        // create order
        app.post('/orders', async ( req, res ) =>{
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder)
            // console.log(result);
            res.send( result )
        })

        // Send a ping to confirm a successful connection
        // await client.db( "admin" ).command({ ping: 1 });
        // console.log( "Pinged your deployment. You successfully connected to MongoDB!" );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch( console.dir );

app.get('/', ( req, res ) => {
    res.send( 'the server is running' );
})

app.listen( port, () => {
    console.log( port );
})