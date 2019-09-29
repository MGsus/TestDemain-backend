const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    userId: {
        type: String,
        default: -1
    },
    isDeleted: {
        type: Boolean,
        default:false
    }
},{
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;