const express = require('express');
const app = express();
const cors = require('cors');
const monogose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

monogose.connect(process.env.DB_URL).then((result)=> {
  console.log("MongoDB Connected Successfully.");
})

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`)
})