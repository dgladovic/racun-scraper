const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNumber: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  name: { type: String, required: true},
  taxName:{ type: String, required: true},
  address:{ type: String, required: true},
  location: { type: String, required: true},
  items: {type: Array, required: false},
  receiptAmount: { type: Number, required: true },
  receiptTax: { type: Number, required: true },
  timeDate: {type: Array, required: false}
});

receiptSchema.pre('save', function (next) {
  this._id = this.receiptNumber;
  next();
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;