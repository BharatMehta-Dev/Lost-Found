const dns = require("dns");
const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured. Add it to backend/.env.");
    }

    try {
        const dnsServers = process.env.MONGO_DNS_SERVERS
            ?.split(",")
            .map((server) => server.trim())
            .filter(Boolean);

        if (dnsServers?.length) {
            dns.setServers(dnsServers);
        }

        const connection = await mongoose.connect(process.env.MONGO_URI, {
            family: 4
        });

        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);
        throw error;
    }
};

module.exports = connectDB;