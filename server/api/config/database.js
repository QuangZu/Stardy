const mongoose = require('mongoose');
require('dotenv').config();

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        const database = process.env.MONGODB_URI || "mongodb+srv://quangzu:k-GxBQY7iLNraHq@stardy.pub4sck.mongodb.net/?retryWrites=true&w=majority&appName=Stardy";
        
        mongoose.connect(database)
        .then(() => {
            console.log("✅ MongoDB connected successfully");
        })
        .catch(err => {
            console.error("❌ MongoDB connection error:", err);
            process.exit(1);
        });

        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            console.log('📡 MongoDB disconnected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB error:', err);
        });
    }

    disconnect() {
        return mongoose.disconnect();
    }
}

module.exports = new Database();