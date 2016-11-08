$(function () {
  $('.mark').click(function(evt) {
    evt.preventDefault();
    var a = $(this);
    var marked = a.data('marked');
    var csrfToken = $("meta[name='csrf_token']").attr("content");
    if (marked == 0) {
      $.ajax({
        type: 'POST',
        url: '/mark/'+a.data('id'),
        headers: {
          "X-CSRF-Token": csrfToken
        },
        dataType: 'json',
        success: function(res) {
          $('.total-marked').text(res.total);
          a.data('marked', 1);
          a.html('Marked');
        }
      });
    } else {
      $.ajax({
        type: 'POST',
        url: '/mark/'+a.data('id')+'?x-tunneled-method=DELETE',
        headers: {
          "X-CSRF-Token": csrfToken
        },
        dataType: 'json',
        success: function(res) {
          $('.total-marked').text(res.total);
          a.data('marked', 0);
          a.html('Not marked');
        }
      });
      if(a.attr('id') && /clickme_(\d{1,})/i.test(a.attr('id'))){
        var indexes = a.attr('id').match(/clickme_\d{1,}/i);
        indexes[0] = indexes[0].replace(/clickme_/,"");
        $('#fade_' + indexes[0]).fadeOut('slow', function() {});
      }
    }
  });
});

$(document).ready(function() {
  var totalMarked = $('.total-marked');
  if (totalMarked.length) {
    $.ajax({
      type: 'GET',
      url: '/marked_total',
      dataType: 'json',
      success: function(res) {
       totalMarked.text(res.total);
      }
    });
  }
});
