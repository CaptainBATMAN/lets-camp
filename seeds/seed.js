const mongoose = require('mongoose');
const Campground = require('../models/campGround.js');

const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/lets-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected!');
});

const randArrayElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 10; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const randPrice = Math.floor(Math.random() * 1000) + 50;
        const camp = await new Campground({
            title: `${randArrayElement(descriptors)} ${randArrayElement(
                places
            )}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam quasi, quaerat ea inventore molestias minus reprehenderit. Error nihil voluptas perferendis nostrum laboriosam illum mollitia, ex doloribus. Repellat quibusdam odio laborum?`,
            price: randPrice,
        });
        await camp.save();
        console.log(camp);
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
