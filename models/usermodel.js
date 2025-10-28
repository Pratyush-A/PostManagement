const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/authenticatioDb')

const userSchenma = new mongoose.Schema({
    name:String,
    email:String,
    age:Number,
    password:String,
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
})

const User = mongoose.model('User',userSchenma);

module.exports = User;