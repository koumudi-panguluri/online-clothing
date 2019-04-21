const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const OrderSchema=new Schema({
  name:{
    type:String,
    required:true
  },
  user:{
    type:String,
    required:true,   //for your own login
  },
date:{
  type:Date,
  default:Date.now
}
})
mongoose.model('orders',OrderSchema);