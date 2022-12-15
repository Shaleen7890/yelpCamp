const mongoose=require('mongoose')
const express=require('express');
const cities=require('./cities')
const{places,descriptors}=require('./seedHelpers')
const Campground = require('../models/campground');
const app=express();

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error'))   
db.once('open',()=>{
    console.log('Database Connected')
});
const sample= (array)=>{
    return array[Math.floor(Math.random()*array.length)];
}
const seedDB= async()=>{
    await Campground.deleteMany({}) 
    for(let i=0; i<200; i++){
        const random1000=Math.floor(Math.random()*1000);
        const price= Math.floor(Math.random()*20)+1;
        const camp=new Campground({
            // your user id
            author:'637b39e4be612091863a8d12',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            geometry:{
                type:'Point',
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta nam, sequi amet totam dolorem consequatur? Numquam tempore ducimus laboriosam enim laudantium debitis incidunt officiis possimus in velit adipisci, quae fuga?',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dmt1qy77e/image/upload/v1669648393/Yelp_Camp/e1w8effueqelqcmrlxhe.jpg',
                  filename: 'Yelp_Camp/e1w8effueqelqcmrlxhe',
                }
              ]
        })
        await camp.save();
    }
}
seedDB().then(()=>{
    db.close();
})   