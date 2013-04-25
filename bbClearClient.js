(function(window){

  var bb = null;
  var cb = null;

  listen("message", window, receiveMessage);
  window.opener.postMessage("get_bbxml", "*");

  function receiveMessage(event){
    if (event.data.slice(0,6) !== 'bbxml:') {return;}
    var xml = event.data.slice(6);
    var bb = BlueButton(xml);

    if (cb){
      cb(bb);
    }
  };

  function listen(evnt, elem, func) {
    if (elem.addEventListener) {
      elem.addEventListener(evnt, func, false);
    }
    else if (elem.attachEvent) { // IE DOM
      var r = elem.attachEvent("on"+evnt, func);
      return r;
    }
  };

  window.onBBData = function(_cb){
    if (bb){
      return _cb(bb);
    }
    cb = _cb;
  };

})(this);
