const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const IdeaSchema=new Schema ({
  name:{
    type:String,
    required:true
  },
  pId:{
    type:Number,
    required:true
  },
  picName:{
    type:String,
    required:true
  },
  amount:{
    type:Number,
    required:true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
mongoose.model('ideas',IdeaSchema);