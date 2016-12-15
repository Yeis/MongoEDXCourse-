var express =  require('express');
var wagner = require('wagner-core');

require('./models')(wagner);
require('./dependencies')(wagner);
var app = express();

wagner.invoke(require('./auth'), {app : app});
app.use('/api/v1', require('./api')(wagner));

app.listen(3000);
console.log('Listening on port 3000!');

////Parameters are model name , schema , collection name 
//var Product = mongoose.model('Product' , productSchema , 'products');
//var User = mongoose.model('User' , userSchema ,  'users');
//
//var p = new Product({
//    name: 'test',
//    price:{
//        amount: 5 ,
//        currency: 'USD'
//    },
//    category:{
//        name:'test'
//    }
//});
//
//p.save(function(error){
//    if(error){
//        console.log(1);
//        process.exit(1);
//    }
//    Product.find({name: 'test'} , function(error , docs){
//        if(error){
//            console.log(error);
//            process.exit(1);
//        }
//           console.log(require('util').inspect(docs));
//          process.exit(0);
//    });
//});
//
//
//console.log(p.internal.approximatePriceUSD);



