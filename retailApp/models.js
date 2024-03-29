var mongoose = require('mongoose');
var _ = require('underscore');
module.exports = function(wagner){
    mongoose.connect('mongodb://localhost:27017/test');
    wagner.factory('db', function(){
        return moongose;
    });
    
    var Category = mongoose.model('Category' , require('./category'), 'categories');
  //  var Product =  mongoose.model('Product', require('./product'),'products'); 
    var User = mongoose.model('User' , require('./user') , 'users');
    var models = {
        Category:Category, 
       // Product:Product,
        User:User
      };
    
    //To ensure DRY-ness register factories in a loop
//    wagner.factory('Category', function(){
//        return Category;
//    });  
//    return {Category:Category};
    _.each(models, function(value , key){
        wagner.factory(key , function(){
            //console.log(key.toString());
            return value ;
        });
    });
    wagner.factory('Product' , require('./product'));
    return models;
};