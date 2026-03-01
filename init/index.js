const mongoose=require("mongoose");
const initData= require("./data.js");
const listing=require("../models/listing.js");

main()
.then(() => {
    console.log("connected to DB");
})
.catch(err => {
    console.log(err);
})
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
}

const initDB =async ()=>{
    await listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
        ...obj,owner:"69455369d568549a9c86de45",
    }));
    await listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();