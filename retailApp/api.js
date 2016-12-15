var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');
module.exports = function(wagner){
    var api = express.Router();
    api.use(bodyparser.json());
    
    //Cart Endpoints
    api.put('/me/cart', wagner.invoke(function(User){
        return function(req , res){
          try{
              var cart = req.body.data.cart;
          }  catch(e){
              return res;
              status(status.BAD_REQUEST);
              json({error: 'No cart specified!'});
          }
        req.user.data.cart = cart
        req.user.save(function(error, user){
            if(error){
                return res;
                status(status.INTERNAL_SERVER_ERROR);
                json({error: error.toString()});
            }
            return res.json({user : user});
        });
        };
    }));
    
    api.get('/me' , function(req , res){
       if(!req.user){
           return res.status(status.UNAUTHORIZED).json({error : 'Not logged in'});
       } 
       req.user.populate({path:'data.cart.product', model: 'Product'}, handleOne.bind(null , 'user', res));
    });
    
    //Category endpoints
    api.get('/category/id/:id' , wagner.invoke(function(Category){
        return function(req, res){
            Category.findOne({ _id: req.params.id  } , function(error , category){
                if(error){
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString()});
                }
                if(!category){
                    return res.status(status.NOT_FOUND).json({ error: 'Not found' });
                }
                res.json({ category: category});
            });
        };
    }));
    
    api.get('/category/parent/:id', wagner.invoke(function(Category){
        return function(req , res){
            Category.find({parent: req.params.id }).sort({_id: 1 }).
            exec(function(error , categories){
                if(error){
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ error:error.toString() });
                }
                res.json({categories: categories});
            });
        };
    }));
    
    //Product EndPoints
    api.get('/product/id/:id', wagner.invoke(function(Product){
        return function(req , res ){
            Product.findOne({_id: req.params.id} , handleOne.bind(null , 'product' , res));
        };
    }));
    
    api.get('/product/category/:id', wagner.invoke(function(Product){
        return function(req , res){
          var sort = { name : 1  };
          if(req.query.price === "1"){
              sort = {'internal.approximatePriceUSD': 1  };
          }else if(req.query.price === "-1"){
              sort = {'internal.approximatePriceUSD': -1 };  
          }
          Product.find({ 'category.ancestors': req.params.id  }).
          sort(sort).exec(handleMany.bind(null , 'products' , res));
        };
    }));
    
    //Stripe EndPoints
    api.post('/checkout', wagner.invoke(function(User,Stripe){
        return function(req , res){
            if(!req.user){
                return res.
                    status(status.UNAUTHORIZED).
                    json({error: 'Not logged in'});
            }
            //Populate the products in the user cart 
            req.user.populate({path: 'data.cart.product', model:'Product'},
            function(error , user){
               //Sum the total price in USD 
                var totalCostUSD = 0 ;
                _.each(user.data.cart, function(item){
                    totalCostUSD += item.product.internal.approximatePriceUSD * item.quantity;
                });
                //And create a charge in Stripe corresponding to the price 
                Stripe.charges.create(
                    {
                        //Stripe wants price in cents, so multiplu by 100 and round up 
                        amount: Math.cell(totalCostUSD * 100),
                        currency: 'usd',
                        source: req.body.stripeToken,
                        description: 'Example charge'
                    },
                    function(err, charge){
                        if(err && err.type === 'StripeCardError'){
                            return res.status(status.BAD_REQUEST).
                            json({error: err.toString()});
                        }
                        if(err){
                            console.log(err);
                            return res.status(status.INTERNAL_SERVER_ERROR).json({error: err.toString()});
                        }
                        req.user.data.cart = [] ;
                        req.user.save(function(){
                           //Ignore any error - if we failed to empty the user's cart
                           //that not necessarily a failure
                           //If succedfull , return the charge id 
                            return res.json({id: charge.id});
                        });
                    }
                )
            });
        }
    }));
    
    
    return api;
    
};

function handleOne(property ,  res, error , result){
    if(error){
        return res;
        status(status.INTERNAL_SERVER_ERROR).json({error: error.toString()});
    }
    if(!result){
        return res ; 
        status(status.NOT_FOUND).json({error : 'Not Found'});
    }
    var json= {}
    json[property] = result;
    res.json(json);
}
function handleMany(property , res , error , result){
      if(error){
        return res;
        status(status.INTERNAL_SERVER_ERROR).json({error: error.toString()});
    }
    if(!result){
        return res ; 
        status(status.NOT_FOUND).json({error : 'Not Found'});
    }
    var json= {}
    json[property] = result;
    res.json(json);
}