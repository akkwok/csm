$(function () {
    //scrollreveal
    window.sr = ScrollReveal({
        reset: true,
        distance: '20px',
        scale:1,
        easing:'ease-in-out',
        duration: 800,
        viewFactor: 0.5
    });

    sr.reveal('#pageContent-scan .table', {
        reset: true,
        opacity:1,
        distance:0,
        duration: 0,
        delay: 0,
        afterReveal: function(){
            $("#pageContent-scan .table").addClass("on");
            $("#pageContent-scan .table .pic_medal").addClass("on");
            
        },
        beforeReset: function(){
            $("#pageContent-scan .table").removeClass("on");
            $("#pageContent-scan .table .pic_medal").removeClass("on");
        }
    });

    sr.reveal('#pageContent-farther .farther_area', {
        reset: true,
        opacity:1,
        distance:0,
        duration: 0,
        delay: 0,
        afterReveal: function(){
            $("#pageContent-farther .chart_b_1").addClass("on");
            $("#pageContent-farther .chart_b_2").addClass("on");
            
        },
        beforeReset: function(){
            $("#pageContent-farther .chart_b_1").removeClass("on");
            $("#pageContent-farther .chart_b_2").removeClass("on");
        }
    });


})