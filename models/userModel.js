const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["tax-accountant", "tax-payer", "admin"],
        default: "tax-payer",
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    }, 
    income: {               //  Annual
        type: Number,
        required: true
    },
    taxType: {
        type: String,
        enum: ["individual", "corporation"],
        default: "individual",
        trim: true
    },
    address: {
        state: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: Number,
            required: true,
            trim: true
        }
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
}, { timestamps: true });

module.exports = mongoose.model('user', userSchema)