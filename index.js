const express = require('express')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
require('dotenv').config()
const { ObjectId, ObjectID } = require('mongodb')



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.extbg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })


const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('doctors'))
app.use(fileUpload())


client.connect(err => {
    const roomCollection = client.db("apartmentHunt").collection("addroom")
    const bookingListCollection = client.db("apartmentHunt").collection("addbooking")

    app.get('/', (req, res) => {
        res.send('Apartment hunt server is running...')
    })

    // @desc    Add all rent house
    // @route   POST /addRentHouse
    app.post('/addRentHouse', (req, res) => {
        const file = req.files.file
        const title = req.body.title
        const location = req.body.location
        const bathroom = req.body.bathroom
        const bedroom = req.body.bedroom
        const price = req.body.price
        console.log(file, title, location, bathroom, bedroom, price)
        const newImg = file.data
        const encImg = newImg.toString('base64')

        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        roomCollection.insertOne({ title, location, bathroom, bedroom, price, image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // @desc    get rent house data
    // @route   GET /getRentHouseData
    app.get('/getRentHouseData', (req, res) => {
        roomCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // @desc    Get dynamic data by id
    // @route   GET /room/:id
    app.get('/room/:id', (req, res) => {
        const id = req.params.id
        roomCollection.find({ _id: ObjectId(id) })
            .toArray((err, documents) => {
            res.send(documents)
        })
    })

    // @desc    Add all booking
    // @route   POST /addBooking
    app.post('/addBooking', (req, res) => {
        const data = req.body
        console.log(data)
        bookingListCollection.insertOne(data)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    // @desc    Get all booking data
    // @route   GET /getRentHouseData
    app.get('/getBooking', (req, res) => {
        const email = req.query.email
        console.log(email)
        bookingListCollection.find({email: email})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // @desc    get rent house data
    // @route   GET /myRent
    app.get('/myRent', (req, res) => {
        roomCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

        // @desc    Update booking status
        // @route   patch /update
        app.patch('/update', (req, res) => {
        bookingListCollection.updateOne(
            { _id: ObjectId(req.body._id) },
            {
                $set: { 'status': req.body.status }
            }
        )
            .then((result) => {
                console.log(result)
            })
    })

    
})


app.listen(process.env.PORT || 5000, () => console.log('listening on port 5000'))