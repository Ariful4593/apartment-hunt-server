const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { ObjectId, ObjectID } = require('mongodb');
require('dotenv').config();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload())
app.get('/', (req, res) => {
    res.send("Hello Apartment Hunt")
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsirj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookinglist = client.db("apartmentHunt").collection("bookinglist");
    const addRentHouse = client.db("apartmentHunt").collection("addrenthouse");
    console.log('Database connected')
    app.post('/addBooking', (req, res) => {
        const data = req.body;
        bookinglist.insertOne(data)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })

    })

    app.get('/getBookingList', (req, res) => {
        bookinglist.find({})
            .toArray((err, document) => {
                res.send(document)
            })
    })

    app.post('/addRentHouse', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const price = req.body.price;
        const location = req.body.location;
        const bedroom = req.body.bedroom;
        const bathroom = req.body.bath;


        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64'),
        }

        addRentHouse.insertOne({ title, price, location, bedroom, bathroom, image })
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/getRentHouseData', (req, res) => {
        addRentHouse.find({})
            .toArray((err, document) => {
                res.send(document)
            })
    })

    app.post('/getClientPlacedRent', (req, res) => {
        const email = req.body.email;
        bookinglist.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.patch('/update', (req, res) => {

        bookinglist.updateOne(
            { _id: ObjectId(req.body.id) },
            {
                $set: { 'status': req.body.status }
            }
        )
            .then((result) => {
                console.log(result)
            })
    })
});



const port = 4000;
app.listen(port)
