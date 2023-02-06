const mongoose = require('mongoose');
const dotenv = require('dotenv');

//whenever there is an unhandled Rejection, the process object will emit an object called an Unhandled Rejection, and we can work on  that by the following  method
//Unhandled Rejections are promises which fail to execute and hence throw error.
process.on('unhandledRejection', (err) => {
  // console.trace('i am here');
  console.log(err);
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!!! Shutting down...');
  process.exit(1);
});

//All errors in synchronous code are unCaughtExceptions

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED Exception!!! Shutting down...');
  process.exit(1);
});
//here we are ivoking config method to read the ENV from config.env file, which loads all the variable into process.env
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

console.log(process.env.DATABASE_PASSWORD, '👾');

//This thing returns a promise
mongoose
  .connect(DB, {
    //.connect(process.env.DATABASE_LOCAL,) to connect to local database
    useNewUrlParser: true,
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

//Here we are passing our schema as an object

//Just to check, which evironment we are working on

console.log(app.get('env'));

// console.log(process.env);

//data handling stuff will be here

//starting server
// console.log(app);
console.log(process.env.PORT);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listenig to ${port}`);
});
