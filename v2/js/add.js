$(function(){
    var i = 0;
    $(".hand-gif .hand-gif-control").bind("keydown click", function(){
        if (i == 0) {
            $(this).addClass('play');
            $('.hand-gif .gif').hide();
            $('.hand-gif .png').show();
            $(this).attr("aria-label","Play the motion");
            i = 1;
            //alert(i);
        } else {
            $(this).removeClass('play');
            $('.hand-gif .gif').show();
            $('.hand-gif .png').hide();
            $(this).attr("aria-label","Pause the motion");
            i = 0;
            //alert(i);
        }
    });
});

