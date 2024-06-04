const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const saleSchema = new mongoose.Schema({

});

module.exports = mongoose.model('Sale', saleSchema);