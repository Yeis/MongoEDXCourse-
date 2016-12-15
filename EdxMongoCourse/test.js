var assert =  require('assert');

describe('my feature' , function(){
  it('works', function(){
     assert.equal('A', 'b');
  });
  it('fails gracefully',function(){
      assert.throws(function(){
          throw 'Error';
      });
  });    
});
