var moongose =  require('mongoose');
var models = require('./models');
var categories = [
            {_id : 'Electronics'},
            {_id: 'Phones' , parent:'Electronics'},
            {_id: 'Laptops' , parent:'Electronics'},
            {_id : 'Bacon'} ];
var products = [
                {
                    name: 'LG G4',
                    category: { _id:'Phones', ancestors:['Electronics', 'Phones']  },
                    price: {amount: 300 , currency:'USD' }
                },
                {
                    name: 'Asus Zenbook Prime',
                    category: { _id:'Laptops', ancestors:['Electronics', 'Laptops']  },
                    price: {amount: 2000 , currency:'USD' }
                },
                {
                    name: 'Flying Pigs Farm Pasture Raised Pork Bacon',
                    category: { _id:'Bacon', ancestors:['Bacon']  },
                    price: {amount: 20 , currency:'USD' }
                } ];
var users = [{
           profile:{
               username: 'vkarpov15',
               //picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWhkAhpeWuU_M3k-r9v7W_13aGVPAuxZOrD_9m9FnoVA391Bf4XJlb1g'
               picture: 'http://pbs.twimg.com/profile_images/550304223036854272/Wwmwuh2t.png'
           } ,
            data:{
                oauth:'invalid',
                cart:[]
            }
        }];
var mongodb = require('mongodb');
var uri = 'mongodb://localhost:27017/example';
var mongodb = require('mongodb');
mongodb.MongoClient.connect(uri , function(error , db)
{
    if(error){
        console.log(error);
        process.exit(1);
    }  
    db.collection('categories').insert(categories , function(error, result){
         if(error){
             console.log(error);
            process.exit(1);
         }
    });
     db.collection('products').insert(products , function(error, result){
         if(error){
             console.log(error);
            process.exit(1);
         }
    });
     db.collection('users').insert(users , function(error, result){
         if(error){
             console.log(error);
            process.exit(1);
         }
    });
    process.exit(0);
    
});
                                
                                       