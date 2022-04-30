$(function() {
  var headHeight = $("header").height();
  var fixedObjTop = $(".js_fixed_block").offset().top;
  var fixedHeight = $(".js_fixed_block").height();
  $(window).scroll(function() {
    var win_top = $(this).scrollTop();
    if (fixedObjTop - win_top <= headHeight) {
      $(".js_fixed_block").addClass("module-title__fixed").css("top", 0 + 'px');
      $("#playlist").css("padding-top", fixedHeight + 'px');
    }
    if (fixedObjTop - win_top > headHeight) {
      $(".js_fixed_block").removeClass("module-title__fixed").css("top", '0px');
      $("#playlist").css("padding-top", '0px');
    }
  });
  $("#read_fx").click(function() {
    if ($(this).attr("class") == "atz") {
      $(this).attr("class", "zta");
    } else {
      $(this).attr("class", "atz");
    }
    Order();
  });
  var groupCount = 30;
  var chapterArray = $("#playlist").find("li");
  var chapterCount = chapterArray.length;
  var chapterGroupArray = [];
  var chapterItemArray = [];
  for (var i = 0; i < chapterCount; i += groupCount) {
    var start = i + 1;
    var end = i + groupCount;
    chapterGroupArray.push(chapterArray.slice(i, chapterCount));
    if (end > chapterCount) {
      end = chapterCount
    }
    chapterItemArray.push([start + '~' + end])
  }
  $("#playlist").find("ul").html(chapterArray) let chapterItemLi = "";
  for (var i = 0; i < chapterItemArray.length; i++) {
    chapterItemLi += ` < li class = "chapter-item js_chapter_item"data - item - index = "${i}" > <a href = "javascript:;" > $ {
      chapterItemArray[i]
    } < /a></li > `
  }
  $(".js_chapter_ul").html(chapterItemLi);
  $(".js_show_chapter").click(function() {
    var maskHeight;
    var obj = $('.js_chapter_wrap');
    var objHeight = obj.height();
    var wh = $(window).height();
    var objOffsetTop = obj.offset().top;
    var docScrollTop = $(document).scrollTop();
    maskHeight = wh - (objOffsetTop - docScrollTop);
    $(".js_module_list").toggleClass("module-z-index");
    $(this).toggleClass("show");
    $(".js_chapter_wrap").toggleClass("show");
    $("html,body").toggleClass("overflow-y-hidden")
  }) $(".js_chapter_item").click(function() {
    var thisItemIndex = $(this).data("itemIndex");
    $(this).addClass("active");
    $(this).siblings(".js_chapter_item").removeClass("active");
    $(".js_chapter_wrap, .js_show_chapter").removeClass("show");
    $(".mask").hide();
    $("html,body").removeClass("overflow-y-hidden");
    $(".js_module_list").removeClass("module-z-index");
    $("#playlist").find("ul").html(chapterGroupArray[thisItemIndex]);
    if ($("#read_fx").attr("class") == "zta") {
      $("#read_fx").attr("class", "atz");
    }
    if ($(".module-title__fixed").hasClass("module-title__fixed")) {
      $("html,body").animate({
        scrollTop: fixedObjTop - fixedHeight
      },
      500);
    }
  })
});

function Order() {
  var box, tag, leng, i, uhtml;
  box = document.getElementById('playlist');
  tag = box.getElementsByTagName('li');
  leng = tag.length;
  uhtml = "";
  for(i = leng - 1; i >= 0; i--) {
    uhtml += '<li>' + tag[i].innerHTML + '</li>';
  }
  uhtml = "<ul>" + uhtml + "</ul>";
  $('#playlist').html(uhtml);
}