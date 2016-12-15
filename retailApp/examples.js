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
        });
        
    }
    
    
}