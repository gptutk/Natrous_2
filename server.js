const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
app.listen(port, () => {
  console.log(`listenig to ${port}`);
});
