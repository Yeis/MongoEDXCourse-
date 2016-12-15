//module.exports = function(){
//    return {
//        USD: 1,
//        EUR: 1.1,
//        GBP:1.5
//    };
//    
//    
//};
var superagent = require('superagent');
var _ = require('underscore');

module.exports = function(Config){
    var url = 'https://openexhangerates.org/api/latest.json?app_id=' + 
        'api key';
    var rates = {
        USD: 1,
        EUR: 1.1,
        GBP: 1.5
    };
    
    var ping = function(callback){
        superagent.get(url , function(error ,res){
           //if error happens, ignore it because we'll try again in an hour 
            if(error){
                if(callback){
                    callback(error);
                }
                return ; 
            }
            //We succefully get the a result
            var results;
            try{
                var results = JSON.parse(res.text);
                _.each(results.rates || {} , function(value , key){
                   rates[key] = value ; 
                });
                if(callback){
                    callback(null , rates);
                }
                
            }catch(e){
                if(callback){
                callback(e);
                }
            }
        });
        
    };
    
    setInterval(ping , 60 * 60 * 1000); //repeat every hour
    
    //Return the current state of the exhange rates
    var ret = function(){
        return rates;
        
    };
    ret.ping = ping ; 
    return ret;
    
    
}