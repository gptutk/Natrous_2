const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

//here we are ivoking config method to read the ENV from config.env file, which loads all the variable into process.env
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// console.log(process.env.DATABASE_PASSWORD, '👾');

//This thing returns a promise
mongoose
  .connect(DB, {
    //.connect(process.env.DATABASE_LOCAL,) to connect to local database
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con);
    // console.log(con.connection);
    console.log('connection successful');
  })
  .catch((err) => {
    console.log('not connected to database 😿', err, '/n/n');
  });

//Read JSON FILE

//fs.readFileSync('tours-simple.json', 'utf-8'); : this returns only..
//..the file in json format, so we use JSON.parse to convert it into..
//..javascript object

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// console.log(tours);

//IMPORTING DATA INTO DATABASE

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('DATA SUCESSFULLY LOADED 😀');
  } catch (err) {
    console.log(err);
  }
};

//DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    const del = await Tour.deleteMany();
    console.log('DATA DELETED SUCCESSFULLY ');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
