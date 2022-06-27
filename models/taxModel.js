const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const taxSchema = new mongoose.Schema({
    userId: {
        type : ObjectId,
        ref : "user",
        required : true
    },
    SGST : Number,
    CGST : {
        type : Number,
        required : true
    },
    taxSlab : {
        type : Number,
        enum : [5,12,18,28],
        default : 12
    },
    toatalDueTax : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        enum : ['New','Paid','Delayed'],
        default : "New"
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
}, { timestamps: true });

module.exports = mongoose.model('tax', taxSchema)