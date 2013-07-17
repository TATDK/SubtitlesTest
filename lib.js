var params = { allowScriptAccess: "always" };
var atts = { id: "yt_player" };
swfobject.embedSWF("http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=ytplayer&version=3", "ytapiplayer", "853", "480", "8", null, null, params, atts);

var videoControllers = {
    setVolume: function(a) {
        if (a > 0) {
            if (player.isMuted()) player.unMute();
        } else {
            if (!player.isMuted()) player.mute();
        }
        player.setVolume(a);
    },
    seekTo: function(a) {
        player.seekTo(a);
    },
    playpause: function() {
        if (player.getPlayerState() === 1) player.pauseVideo();
        else player.playVideo();
    },
    stop: function() {
        //Stop video
        this.seekTo(0);
        player.stopVideo();

        //Clear subtitles
        subtitleController.currentSubtitle = -1;
        subtitleController.clear();
    }
}

function onYouTubePlayerReady(playerId) {
    player = document.getElementById("yt_player");
    player.loadVideoById('8DPGGa-K7P8');
    player.addEventListener("onStateChange", "onYouTubePlayerStateChange");
    player.stopVideo();
    $('#volume').val(player.isMuted() ? 0 : player.getVolume());
    setInterval(function() { subtitleController.show(player.getCurrentTime()); },100);
}

function onYouTubePlayerStateChange(state) {
    if (state == 1) $('#btn-playpause').removeClass('icon-play').addClass('icon-pause');
    else $('#btn-playpause').removeClass('icon-pause').addClass('icon-play');
}

var subtitleController = {
    init: function() {
        this.currentSubtitle = -1;
        this.subtitles = this.parse();
    },
    toSeconds: function(a) {
        var b = 0.0;
        if (a) {
            var c = a.split(':');
            for (d = 0;d < c.length;d++)
                b = b * 60 + parseFloat(c[d].replace(',', '.'));
        }
        return b;
    },
    fromSeconds: function(a) {
        var b = {a:0,b:0,c:0,d:0};
        if (a) {
            b.a = Math.floor(a/3600);
            a -= b.a*3600;
            b.b = Math.floor(a/60);
            a -= b.b*60;
            b.c = Math.floor(a);
            a -= b.c;
            b.d = Math.floor(a*1000);
        }
        return (b.a < 10 ? '0' : '') + b.a + ':' + (b.b < 10 ? '0' : '') + b.b + ':' + (b.c < 10 ? '0' : '') + b.c + ',' + (b.d < 100 ? '00' : b.d < 10 ? '0' : '') + b.d;
    },
    strip: function(a) {
        return a === undefined ? '' : a.replace(/^\s+|\s+$/g,"");
    },
    parse: function() {
        var a = $('#subtitles').html().replace(/\r\n|\r|\n/g, '\n').split('\n');
        a.forEach(function(b,c) { a[c] = b.trim(); });
        a = a.join('\n');

        var b = [];
        a = this.strip(a).split('--&gt;').join('-->');
        $('#source').text(a);
        var c = a.split('\n\n');
        for (d in c) {
            e = c[d].split('\n');
            if (e.length >=2) {
                n = e[0];
                i = this.strip(e[1].split(' --> ')[0]);
                o = this.strip(e[1].split(' --> ')[1]);
                t = e[2].trim();
                if (e.length > 2) {
                    for (f = 3;f < e.length;f++)
                        t += '<br />' + e[f];
                }
                is = this.toSeconds(i);
                os = this.toSeconds(o);
                b.push({i:is, o: os, t: t});
            }
        }
        return b;
    },
    clear: function() {
        $('.subtitles-overlay').find('span').html('').css('display','none');
    },
    show: function(a) {
        $('#timer').text(this.fromSeconds(a));
        $('#seeker').attr('max',player.getDuration()).val(a);
        var b = {i:0};
        for (c in this.subtitles) {
            var d = subtitleController.subtitles[c];
            if (d.i > a) continue;
            if (d.i < b.i) continue;
            b = c;
        }
        if (b >= 0) {
            if (b != this.currentSubtitle) {
                this.currentSubtitle = b;
                $('.subtitles-overlay').css('top',$(player).height()-10-(20*this.subtitles[b].t.split('<br />').length)).find('span').html(this.subtitles[b].t).css('display','inline');
            } else if (this.subtitles[b].o < a) this.clear();
        }
    }
}

var player;

subtitleController.init();