var timers;
function piaoluo(){
  var d = "<div class='snow'><img src='../../image/jinbi.png'><div>";
  timers = setInterval(function() {
      var f = api.winWidth;
      var e = Math.random() * f;
      var o = 0.3 + Math.random();
      var fon = 10 + Math.random() * 30;
      var l = e - 100 + 200 * Math.random();
      var k = 2000 + 5000 * Math.random();
      $(d).clone().appendTo("#app").css({
          left: e + "px",
          "font-size": fon,
      }).animate({
          top: "1200px",
          left: l + "px",
      }, k, "linear", function() {
          $(this).remove()
      })

  }, 10)
}
