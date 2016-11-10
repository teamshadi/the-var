'use strict';

describe('Service: Portfolios', function () {

  // fixtures
  var ppp = {
    '1': {
      'id': '1',
      'src': 'mod',
      'name': 'portfolio 1',
      'assets': [
        { 'src': 'src1',
          'symbol': 'symbol1'
        },
        { 'src': 'src1',
          'symbol': 'symbol2'
        }
      ]
    }
  };

  var aaa = {
    mod: {
      symbol1: { historyMeta:{ lastprice:  5 } },
      symbol2: { historyMeta:{ lastprice: 10 } }
    },
    src2: {
      symbol3: { price: 0 },
      symbol4: { price: 0 }
    }
  };

  // load the service's module
  beforeEach(module('theVarApp'));

  // instantiate service
  var Portfolios;
  beforeEach(inject(function (_Portfolios_, _Assets_) {
    Portfolios = _Portfolios_;

    // for the listAssets function used from the 'unallocated' test
    spyOn(_Assets_, 'list').and.callFake(function() {
      return aaa;
    });

  }));

  it('set list np', function () {
    expect(!!Portfolios).toBe(true);
    expect(Portfolios.np()===0);
    Portfolios.set(ppp);
    expect(Portfolios.np()===1);
  });

  it('add del portfolio', function () {
    Portfolios.clear();
    // add new portfolio
    var n0 = Portfolios.np();
    var pid1=Portfolios.add('portfolio 2','mod',[]);
    expect(Portfolios.np()).toBe(n0+1);
    // add existing
    console.log('expect error: portfolio already contains');
    var pid2 = Portfolios.add('portfolio 2','mod',[]);
    expect(pid1).toBe(pid2);
    expect(Portfolios.np()).toBe(n0+1);
    // del
    Portfolios.del(pid1);
    expect(Portfolios.np()).toBe(n0);
  });

  it('add rm asset', function () {
    Portfolios.clear();

    var aaa1={src:'mod',lookup:{Symbol:'symbol1'}};
    // add new portfolio
    expect(Portfolios.holdingAsset(aaa1.src,aaa1.lookup.Symbol,false).length===0);
    expect(Portfolios.holdingAsset(aaa1.src,aaa1.lookup.Symbol,true).length===Portfolios.np());
    var pid=Portfolios.add('portfolio 2','mod',[]);
    Portfolios.addAsset(pid,aaa1);
    var p1 = Portfolios.holdingAsset(aaa1.src,aaa1.lookup.Symbol,false);
    expect(p1.length===1);
    p1=p1[0];
    expect(Portfolios.holdingAsset(aaa1.src,aaa1.lookup.Symbol,true).length===0);
    expect(p1.assets.length===1);
    expect(p1.assets[0].pct===undefined);
    aaa1.pct=10;
    Portfolios.assetPct(pid,aaa1);
    expect(p1.assets[0].pct===10);
  });

  it('update name', function () {
    Portfolios.clear();

    var pid=Portfolios.add('portfolio 2','mod',[]);
    var p1=Portfolios.list()[pid];
    expect(p1.name==='portfolio 2');
    Portfolios.updateName(pid,'portfolio 3');
    expect(p1.name==='portfolio 3');
  });
 
  it('unallocated', function () {
    expect(Portfolios.unallocated()).toBe(false);
    var pid=Portfolios.add('manual 2','portfolio 2',[]);
    // before setting value, should be false
    console.log('Expect error: no portfolio value set');
    expect(Portfolios.unallocated(pid)).toBe(false);
    // set value
    Portfolios.updateValue(pid,250);
    // add asset
    var a1 = {src:'mod',lookup:{Symbol:'symbol1'},qty:10};
    Portfolios.addAsset(pid,a1);
    Portfolios.assetPct(pid,a1);
    // check unallocated
    expect(Portfolios.unallocated(pid)).toBe(80);

    // add another asset
    var a2 = {src:'mod',lookup:{Symbol:'symbol2'},qty:10,historyMeta:{lastprice:10}};
    Portfolios.addAsset(pid,a2);
    Portfolios.assetPct(pid,a2);
    expect(Portfolios.unallocated(pid)).toBe(40);

    // update qty
    a2.qty=15;
    Portfolios.assetPct(pid,a2);
    expect(Portfolios.unallocated(pid)).toBe(20);
  });

});
