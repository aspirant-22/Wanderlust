require("dotenv").config({ path: "../.env" });

const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to Atlas");
}

main()
    .then(() => initDB())
    .catch((err) => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});

    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: '69ea3b22ee96a226c5c3475e'
    }));

    await Listing.insertMany(initData.data);

    console.log("Data was successfully initialised");

    mongoose.connection.close(); // ✅ close connection
};