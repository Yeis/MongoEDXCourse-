var stripe = require('stripe');

module.exports = function(wagner){
    var stripe = Stripe("sk_test_OZCHFeuwVKs4L7f666LwvuQp");
    
    wagner.factory('Stripe',function(){
       return stripe; 
    });
    return{
      Stripe:stripe  
    };
    wagner.factory('fx', fx);
};