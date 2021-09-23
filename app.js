const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const ErrorHandler = require('./utils/ErrorHandler.js');
const Campground = require('./models/campGround.js');

//to connect to local MongoDb
mongoose.connect('mongodb://localhost:27017/lets-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', () => {
    console.log('Database Connected!');
});

const app = express();
const port = process.env.PORT || 3000;

//  express options for setting up:
// static files, views dir and for body parser and method-override.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// routes
app.get('/campgrounds', async (req, res, next) => {
    try {
        const campData = await Campground.find({});
        res.render('campgrounds/index.ejs', { campData });
    } catch (err) {
        next(new ErrorHandler('Something Went Wrong!', 500));
    }
});

app.get('/campgrounds/new', (req, res, next) => {
    try {
        res.render('campgrounds/new');
    } catch (err) {
        next(new ErrorHandler('404! Page not found!', 404));
    }
});

app.post('/campgrounds', async (req, res, next) => {
    const { title, location, price, description, image } = req.body;
    try {
        const newCamp = new Campground({
            title: title,
            location: location,
            price: price,
            description: description,
            image: image,
        });
        await newCamp.save();
        res.redirect('/campgrounds');
        console.log(newCamp);
    } catch (err) {
        next(new ErrorHandler('Something went wrong!', 503));
    }
});

app.get('/campgrounds/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const campData = await Campground.findById(id);
        res.render('campgrounds/show', { campData });
    } catch (err) {
        next(
            new ErrorHandler(
                'Unable to find the product with the given ID',
                404
            )
        );
    }
});

app.get('/campgrounds/:id/edit', async (req, res, next) => {
    try {
        const camp = await Campground.findById(req.params.id);
        res.render('campgrounds/edit.ejs', { camp });
    } catch (err) {
        next(new ErrorHandler('No product exists on the given ID.', 400));
    }
});

app.patch('/campgrounds/:id', async (req, res, next) => {
    const { id } = req.params;
    const { title, location, price, description, image } = req.body;
    try {
        const updatedCamp = await Campground.findByIdAndUpdate(
            id,
            {
                title: title,
                location: location,
                price: price,
                description: description,
                image: image,
            },
            { new: true, runValidators: true }
        );
        res.redirect(`/campgrounds/${id}`);
        console.log(updatedCamp);
    } catch (err) {
        next(new ErrorHandler(`Unable to update`, 400));
    }
});

app.delete('/campgrounds/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedCamp = await Campground.findByIdAndDelete(id);
        console.log(deletedCamp);
        res.redirect('/campgrounds/');
    } catch (err) {
        next(new ErrorHandler('Cannot Find anything for the given ID'));
    }
});

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.all('*', (req, res, next) => {
    next(new ErrorHandler('404! Page not found!', 404));
});

app.use((err, req, res, next) => {
    const { message = 'bad request', statusCode = 400 } = err;
    res.status(statusCode).send(message);
});

// to listen on a given port
app.listen(port, () => {
    console.log(`App started listening on port ${port}`);
});
