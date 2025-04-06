const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const  authRoutes = require('./routes/authRoutes');
const toDoRoutes = require('./routes/toDoRoutes');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/todo', toDoRoutes);

mongoose.connect(process.env.DB_URL).then((result)=> {
  console.log("MongoDB Connected Successfully.");
}).catch(err=>{
    console.log(err);
})

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`)
})
