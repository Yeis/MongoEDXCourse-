var superagent =  require('superagent');
var assert = require('assert');
var wagner = require('wagner-core');
var status = require('http-status');
var express =  require('express');
var URL_ROOT = 'http://localhost:3000';
var PRODUCT_ID = '000000000000000000000001';

describe('API', function(){
    var server;
    var Category;
    var Product;
    var User;
    var Stripe;
    var dependencies;
    
    
    before(function(){
        //Make Category model available in tests
        models = require('./models')(wagner);
        Stripe = require('./dependencies')(wagner);
        var deps = wagner.invoke(function(Category, Product, Stripe, User) {
        return {
            Category: Category,
            Product: Product,
            Stripe: Stripe,
            User: User,
        };
        });
        
    
        User = deps.User;
        Category = deps.Category;
        Product = deps.Product;
        Stripe =  deps.Stripe ; 
       // Stripe = dependencies.Stripe;
        var app = express();
        
        app.use(function(req,res, next){
            User.findOne({}, function(error , user){
               assert.ifError(error);
               req.user = user;
                next();
            });
        });
        //Bootstrap server 
        app.use(require('./api')(wagner));
        
        server =  app.listen(3000);
   
    });
    
    after(function(){
        //Shut the server down when we're done 
        server.close();
    });
    
    beforeEach(function(done){
            Category.remove({} , function(error){
            assert.ifError(error);
            Product.remove({} , function(error){
                assert.ifError(error);
                User.remove({}, function(error){
                   assert.ifError(error); 
                    console.log('Records Eliminated');
                    done();
                });
            });
        });
    });
    
    beforeEach(function(done){
        //Make sure categories are empty before each test 
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
        Category.create(categories, function(error){
            assert.ifError(error);
            Product.create(products , function(error){
                assert.ifError(error);
                User.create(users , function(error){
                   assert.ifError(error);
                   done();
                });
            });
        });    
    });
    //Catgory Endpoint tests
    it('can load a category by id' , function(done){
        //Create a single category
            var url = URL_ROOT + '/category/id/Electronics';
            //make an http request to localhost:3000/category/id/electronics
            superagent.get(url , function(error , res){
                assert.ifError(error);
                var result;
                //And make ure we got { _id:'Electronics'} back
                assert.doesNotThrow(function(){
                    result = JSON.parse(res.text);
                });
                assert.ok(result.category);
                assert.equal(result.category._id ,  'Electronics');
                done();
            });
    });
    
    it('can load all categories that have a certain parent', function(done){
        var categories = [
            {_id : 'Electronics'},
            {_id: 'Phones' , parent:'Electronics'},
            {_id: 'Laptops' , parent:'Electronics'},
            {_id : 'Bacon'} ];
        //Create 4 categories 
        Category.create(categories , function(error , categories){
            var url = URL_ROOT +  '/category/parent/Electronics';
            //Make an http request to localhost:3000/category/parent/electronics
            superagent.get(url , function(error , res){
                assert.ifError(error);
                var result;
                assert.doesNotThrow(function(){
                    result =  JSON.parse(res.text);
                });
                assert.equal(result.categories.length , 2);
                //Should be in ascending order by _id
                assert.equal(result.categories[0]._id , 'Laptops');
                assert.equal(result.categories[1]._id , 'Phones');
                done();
  
            });

        });
    });
    //Product Endpoint tests
    it('can load a product by id', function(done){
        //Create a single Product 
        var product ={
            name: 'LG G4',
            _id : PRODUCT_ID,
            price:{
                amount : 300,
                currency: 'USD'
            }
        };
        console.log(product.name);
        Product.create(product, function(error,doc ){
            assert.ifError(error);
            var url = URL_ROOT + '/product/id/'+ PRODUCT_ID
            //Make HTTP Request to localhost:3000/product/id/0000000000000001
            superagent.get(url , function(error, res){
                assert.ifError(error);
                var result ;
                //And make sure we got the LG G$ back
                assert.doesNotThrow(function(){
                   result = JSON.parse(res.text); 
                });
                assert.ok(result.product);
                assert.equal(result.product._id, PRODUCT_ID);
                assert.equal(result.product.name , 'LG G4');
                done();
            });
        });
    });
    
    it('can load all products in a category with sub-categories',function(done){
                var url  = URL_ROOT + '/product/category/Electronics';
                //Make an HTTP request to localhost:3000/product/ancestor/Electronics
                superagent.get(url , function(error , res){
                    assert.ifError(error);
                    var result ; 
                    assert.doesNotThrow(function(){
                        result = JSON.parse(res.text);
                    });
                    assert.equal(result.products.length, 2 );
                    //Should be in ascending order by name 
                    assert.equal(result.products[0].name , 'Asus Zenbook Prime');
                    assert.equal(result.products[1].name , 'LG G4');
                    console.log('Electronics Products Retrieved');
                    
                    //Sort by price, ascending
                    var url = URL_ROOT + '/product/category/Electronics?price=1';
                    superagent.get(url , function(error, res){
                       assert.ifError(error);
                       var result;
                    assert.doesNotThrow(function(){
                        result = JSON.parse(res.text);
                    });
                    //Should be in ascending order by name 
                    assert.equal(result.products.length, 2 );
                    assert.equal(result.products[1].name , 'Asus Zenbook Prime');
                    assert.equal(result.products[0].name , 'LG G4');
                    console.log('Electronics Products Retrieved and Sorted');
                    done();
                    });
                });
    });
    //Cart Endpoint Tests
    it('can save users cart', function(done){
        var url = URL_ROOT + '/me/cart' ;
        superagent.
        put(url).
        send({
            data: {
                cart:[{product : PRODUCT_ID , quantity : 1}]
            }
        }).
        end(function(error , res){
            assert.ifError(error);
            assert.equal(res.status, status.OK);
            User.findOne({}, function(error , user){
               assert.ifError(error);
               assert.equal(user.data.cart.length, 1);
               assert.equal(user.data.cart[0].product , PRODUCT_ID);
               assert.equal(user.data.cart[0].quantity , 1);
               done();
            });
        })
    });
    
    it('can load users cart', function(done){
        var url = URL_ROOT + '/me';
        User.findOne({}, function(error, user){
           assert.ifError(error);
           user.data.cart = [{product: PRODUCT_ID , quantity: 1}];
           user.save(function(error){
              assert.ifError(error);
              superagent.get(url , function(error , res){
                 assert.ifError(error); 
                 assert.equal(res.status , 200);
                 var result;
                 assert.doesNotThrow(function(){
                    result = JSON.parse(res.text).user ;  
                     console.log(result);
                 });
                 assert.equal(result.data.cart.length, 1);
                 assert.equal(result.data.cart[0].product.name, 'Asus Zenbook');
                 assert.equal(result.data.cart[0].quantity, 1);
                 done();

                  
              });
           });
        });
    });
    
    //Stripe test 
    it('can check out',function(done){
        var url = URL_ROOT + '/checkout';
        //set up data
        User.findOne({}, function(error , user){
            assert.ifError(error);
            user.data.cart = [{product: PRODUCT_ID , quantity: 1 }];
            user.save(function(error){
                assert.ifError(error);
                //attempt to check out by posting /api/v1/checkout
                superagent.post(url).
                send({
                    //fake stripe credentials, stripeToken can either be real credit card
                    //credentials or an encrypted token - in production it will be an encrypted 
                    //token
                    stripeToken:{
                        number: '4242424242424242',
                        cvc: '123',
                        exp_month: '12',
                        exp_year: '2016'
                    }
                }).end(function(error , res){
                   assert.ifError(error);
                   assert.equal(res.status , 200);
                   var result;
                 assert.doesNotThrow(function(){
                     result = JSON.parse(res.text);
                 });
                 //Api call gives us back charge id
                 assert.ok(result.id);
                //make sure stripe got the id
                Stripe.charges.retrieve(result.id , function(error , charge){
                    assert.ifError(error);
                    assert.ok(charge);
                    assert.equal(charge.amount , 2000 * 100) ;// 2000usd
                    done();
                });
                    
                });
            });
        });
    });
    
    //Search Text 
    it('can search by text', function(done){
        var url  =  URL_ROOT + '/product/text/asus';
        //Get products whose name contains 'asus'
        superagent.get(url , function(error , res){
            assert.ifError(error);
            assert.equal(res.status , status.OK);
            
            var results;
            assert.doesNotThrow(function(){
                results = JSON.parse(res.text).products;
            });
            //expect that we got the Zenbook Prime back 
            assert.equal(results.length , 1);
            assert.equal(results[0]._id , PRODUCT_ID);
            assert.equal(results[0].name , 'Asus Zenbook Prime'); 
        });
        
        
    });
    
});