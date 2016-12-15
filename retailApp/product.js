var mongoose = require('mongoose');
var Category = require('./category');
var fx =  require('./fx')

module.exports = function(db , fx){
    
    
    
    
}
var productSchema = {
    name : { type: String , required: true },
    //Pictures must start with http://
    pictures : [{type: String ,  match: /^http:\/\//i}],
    price :{ amount: {
        type:Number ,
        required: true ,
        set: function(v){
            this.internal.approximatePriceUSD = v / (fx()[this.price.currency] || 1);
            return v;
        }
        
                     },
            //only supported currencies for now
             currency: {type : String  , enum: ['USD','EUR' , 'GBP'],
                       required: true ,
                        set: function(v){
                            this.internal.approximatePriceUSD = 
                                this.price.amount / (fx()[v] || 1);
                                return v;
                        }
                       }
           },
    category : Category.categorySchema,
    internal:{
        approximatePriceUSD:Number
    }
};

var schema  = new mongoose.Schema(productSchema);
schema.index({name : 'text'});

//module.exports =  new mongoose.Schema(productSchema);
//module.exports.productSchema = productSchema ;