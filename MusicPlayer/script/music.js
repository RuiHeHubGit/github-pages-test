/**
 * Created by HeRui on 2016/6/3.
 */
 

function startMusicPlayer(){
    var audio = document.getElementById("player-audio");
    var info_singer = document.getElementById("music-singer");
    var info_name = document.getElementById("music-name");
    var btn_playOrPause = document.getElementById("btn-playOrPause");
    var btn_lastSong = document.getElementById("btn-lastSong");
    var btn_nextSong = document.getElementById("btn-nextSong");
    var btn_volIcon = document.getElementById("btn-volIcon");
    var btn_setCycleMode = document.getElementById("btn-setCycleMode");
    var poster = document.getElementById("poster-bkImg");
    var posterImg = document.getElementById("poster-img");
    var poster_btn = document.getElementById("poster-play-btn");
    var textCurrentTime = document.getElementById("text-currentTime");
    var textDuration = document.getElementById("text-duration");
    var playing_bk = document.getElementById("playing-item-bk");
    var audioCtlInterval = null;
    var vol = 1;
    var listRowHeight = 0;
    var musicIndex = 0;
    var listCyclMode = 0;
    var loaded = false;
    var listItems;
    var musicList = new Array();
    var dataIsLoaded = false;

    function setMusicList(data) {
        if (data.result == undefined || data.result.songCount == 0) {
            return;
        }
        var songs = data.result.songs;
        musicList.splice(0, musicList.length);
        for (var i = 0; i < songs.length; i++) {
            var item = Object();
            item.url = songs[i].audio;
            item.name = songs[i].name;
            item.time = "";
            item.singer = songs[i].artists[0].name;
            item.special = songs[i].album.name;
            item.poster = songs[i].album.picUrl;
            musicList.push(item);
        }
        dataIsLoaded = true;
        initMusicList();
    }

    function search(searchText) {
        if (searchText == null || searchText.length < 1) {
            return;
        }

        $.ajax({
            type: "get",
            async: false,
            url: "https://s.music.163.com/search/get?type=1&s=" + searchText + "&limit=300",
            dataType: "jsonp",
            success: function(result){
                setMusicList(result);
            },
            error: function(){

            }
        });
    }

    function OnGetSong(data) {
        if (data.result == undefined || data.result.songCount == 0) {
            return;
        }
        var songs = data.result.songs;
        if (songs.length > 0) {
            var song = songs[0];
            var item = Object();
            item.url = song.audio;
            item.name = song.name;
            item.singer = song.artists[0].name;
            item.special = song.album.name;
            item.poster = song.album.picUrl;
            musicList.push(item);
        }
    }

    function addSearchFirstSong(searchText, isLast){
        $.ajax({
            type: "get",
            async: false,
            url: "https://s.music.163.com/search/get?type=1&s=" + searchText + "&limit=2",
            dataType: "jsonp",
            callback: null,
            success: function(json){
                OnGetSong(json);
                if(isLast){
                    initMusicList();
                    initMusicSide();
                    initPlayer();
                    setAudio(0);
                }
            },
            error: function(){

            }
        });
    }

    function getBaiduSongList(type) {
        loadingUI(true);
        $.ajax({
            type: "get",
            async: false,
            url: "https://tingapi.ting.baidu.com/v1/restserver/ting?format=json&callback=&from=webapp_music&method=baidu.ting.billboard.billList&type="+type+"&size=20&offset=0",
            dataType: "jsonp",
            success: function(json){
                saveBaiBuList(json);
            },
            error: function(){

            }
        });
    }

    function saveBaiBuList(data){
        var songs = data.song_list;
        musicList.splice(0, musicList.length);
        for(var i = 0; i < songs.length; i++){
            addSearchFirstSong(songs[i].title, i==songs.length - 1);
        }
        loadingUI(false);
    }

    var progress = function (progress, dragCallback, stopCallback) {
        this.bar = document.getElementById(progress);
        this.units = this.bar.getElementsByTagName("div");
        this.space_load = this.units[1];
        this.space_progress = this.units[2];
        this.btn = this.units[3];
        this.scale = 0;
        this.canSerPos = true;
        this.dragCallbackFn = dragCallback;
        this.stopCallbackFn = stopCallback;
        this.init();
        this.setSpacePosition(0);
    };
    progress.prototype = {
        init: function () {
            var fn = this, doc = document, wnd = window, M = Math;
            fn.bar.onmousedown = function (e) {
                var scale = (e.pageX - this.getBoundingClientRect().left) / this.getBoundingClientRect().width;
                fn.scale = scale;
                fn.setSpacePosition(fn.scale);
                if (fn.stopCallbackFn != null)
                    fn.stopCallbackFn(fn.scale);
            }
            fn.btn.onmousedown = function (e) {
                fn.space_progress.style.transition = "none";
                fn.btn.style.transition = "none";
                fn.canSerPos = false;
                var x = (e || wnd.event).clientX;
                var l = this.offsetLeft;
                var max = fn.bar.offsetWidth;
                doc.onmousemove = function (e) {
                    var thisX = (e || wnd.event).clientX;
                    var to = M.min(max, M.max(-2, l + (thisX - x)));
                    var scale = to / max;
                    fn.space_progress.style.width = scale * 100 + "%";
                    fn.btn.style.left = scale * 100 + '%';
                    fn.ondrag(scale, to);
                    wnd.getSelection ? wnd.getSelection().removeAllRanges() : doc.selection.empty();
                };
                doc.onmouseup = function () {
                    fn.space_progress.style.transition = "all 0.5s";
                    fn.btn.style.transition = "all 0.5s";
                    fn.canSerPos = true;
                    if (this.onmousemove == null)
                        return;
                    if (fn.stopCallbackFn != null)
                        fn.stopCallbackFn(fn.scale);
                    this.onmousemove = null;
                };
            };
        },
        ondrag: function (scale, x) {
            this.scale = scale;
            if (this.dragCallbackFn != null)
                this.dragCallbackFn(this.scale);
            this.btn.title = Math.round(scale * 100) + "%";
        },
        setSpacePosition: function (scale) {
            if (this.canSerPos == false)
                return;
            if (scale < 0 || scale > 1)
                return;
            this.scale = Math.round(scale * 1000) / 1000;
            this.space_progress.style.width = 100 * this.scale + "%";
            this.btn.style.left = 100 * this.scale + "%";
            if (this.dragCallbackFn != null)
                this.dragCallbackFn(this.scale);
            this.btn.title = Math.round(scale * 100) + "%";
        },
        setLoadPosition: function (scale) {
            if (scale < 0 || scale > 1)
                return;
            console.log(Math.round(scale * 100));
            this.space_load.style.width = Math.round(scale * 100) + "%";
        }
    }
    var progressMusic = new progress("progress-music", setCurrentTimeText, setAudioPosition);
    var progressVol = new progress("progress-vol", null, setVolume);
    progressVol.setSpacePosition(vol);

    function GetPageScroll() {
        var x = 0, y = 0;
        if (window.pageYOffset) {    // all except IE
            y = window.pageYOffset;
            x = window.pageXOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) {    // IE 6 Strict
            y = document.documentElement.scrollTop;
            x = document.documentElement.scrollLeft;
        } else if (document.body) {    // all other IE
            y = document.body.scrollTop;
            x = document.body.scrollLeft;
        }
        return {X: x, Y: y};
    }

    function initMusicSide() {
        var items = document.getElementsByClassName("music-classify-item");
        if (items == null || items.length == 0)
            return;
        items[0].style.backgroundColor = "rgba(130, 158, 175, 0.71)";
        for (var i = 0; i < items.length; i++) {
            items[i].onclick = function () {
                for (var j = 0; j < items.length; j++) {
                    items[j].style.backgroundColor = "transparent";
                }
                this.style.backgroundColor = "rgba(130, 158, 175, 0.71)";
            }
        }

    }

    //初始化歌曲列表
    function initMusicList() {

        var listTable = document.getElementById("list-tbody");
        var tdClassList = ['td-id', 'td-operate', 'td-name', 'td-singer', 'td-special'];
        listTable.innerHTML = "";
        document.getElementById("list-content").scrollTop = 0;
        for (var i = 0; i < musicList.length; i++) {
            var tr = document.createElement("tr");
            tr.setAttribute("class", "list-item");
            for (var j = 0; j < tdClassList.length; j++) {
                var td = document.createElement("td");
                td.setAttribute("class", tdClassList[j]);
                switch (j) {
                    case 0:
                        td.textContent = (i + 1 < 10) ? "0" + (i + 1) : (i + 1) + "";
                        break;
                    case 1:
                    {
                        var div1 = document.createElement("div");
                        var div2 = document.createElement("div");
                        div2.setAttribute("class", "like");
                        var div3 = document.createElement("div");
                        div3.setAttribute("class", "delete");
                        div1.appendChild(div2);
                        div1.appendChild(div3);
                        td.appendChild(div1);
                    }
                        break;
                    case 2:
                        td.textContent = musicList[i].name;
                        break;
                    case 3:
                        td.textContent = musicList[i].singer;
                        break;
                    case 4:
                        td.textContent = musicList[i].special;
                        break;
                }
                tr.appendChild(td);
            }

            tr.style.backgroundColor = i % 2 == 0 ? "rgba(230, 230, 230, 0.40)" : "rgba(200, 230, 240, 0.40)";
            tr.setAttribute("data", i + "");
            listTable.appendChild(tr);
            if (listRowHeight == 0)
                listRowHeight = tr.getBoundingClientRect().height;
            tr.onmouseout = function () {
                var index = parseInt(this.getAttribute("data"));
                this.style.backgroundColor = index % 2 == 0 ? "rgba(230, 230, 230, 0.40)" : "rgba(200, 230, 240, 0.40)";
            }
            tr.onmouseover = function () {
                this.style.backgroundColor = "rgba(160, 180, 200, 0.61)";
            }

            tr.onclick = function () {
                playing_bk.style.top = this.offsetTop+"px";
                pauseMusic();
                setAudio(parseInt(this.getAttribute("data")));
                setTimeout(function () {
                    playMusic();
                }, 500);
            }
        }
        listItems = document.getElementsByClassName("list-item");
    }

    function initListScroll() {
        var listPanel = document.getElementById("list-content");
        var scrollBar = document.getElementById("scroll-bar");
        var scrollBtn = document.getElementById("scroll-btn");
        var d = 15, scrollTop = 0.0, drt = 1, lastDrt = 1, scrollBarDownY = 0, an = 0.0;
        var val = null;
        var wnd = window, doc = document;

        function wheelPage() {
            if (val != null)
                return;
            val = setInterval(function () {
                if (an > 0) {
                    scrollTop += an * drt;
                    listPanel.scrollTop = parseInt(scrollTop);
                    an -= 0.1;
                }
                else {
                    listPanel.scrollTop = parseInt(scrollTop + 0.5);
                    clearInterval(val);
                    val = null;
                }
            }, 30);
        }


        var setBar = function () {
            var scan = listPanel.getBoundingClientRect().height / listPanel.scrollHeight;
            if (scan >= 1) {
                scrollBtn.style.display = "none"
            }
            else {
                scrollBtn.style.display = "block"
                scrollBtn.style.height = (scan * 100) + "%";
                scrollBtn.style.top = (listPanel.scrollTop / listPanel.scrollHeight * 100) + "%";
            }
        }
        setTimeout(function () {
            setBar();
        }, 1000);

        listPanel.onscroll = function () {
            setBar();
        }

        var mouseMove = function (e) {
            if (scrollBarDownY > 0)
                listPanel.scrollTop = (e.pageY - scrollBar.getBoundingClientRect().top - scrollBarDownY) / listPanel.getBoundingClientRect().height * listPanel.scrollHeight;
            wnd.getSelection ? wnd.getSelection().removeAllRanges() : doc.selection.empty();
        }

        doc.onmouseup = function () {
            scrollBarDownY = 0;
            doc.onmousemove = null;
        }

        scrollBtn.onmousedown = function (e) {
            if (val != null) {
                clearInterval(val);
                val = null;
            }
            an = 0;
            scrollBarDownY = e.pageY - scrollBtn.getBoundingClientRect().top;
            doc.onmousemove = mouseMove;
        }

        scrollBar.onmousedown = function (e) {
            if (val != null) {
                clearInterval(val);
                val = null;
            }
            an = 0;

            if (e.pageY < scrollBtn.getBoundingClientRect().top || e.pageY > scrollBtn.getBoundingClientRect().bottom) {
                scrollBarDownY = 1;
                listPanel.scrollTop = (e.pageY - scrollBar.getBoundingClientRect().top) / listPanel.getBoundingClientRect().height * listPanel.scrollHeight;
            }
        }

        scrollBar.onmousewheel = listPanel.onmousewheel = function (e) {

            if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
                if (e.wheelDelta > 0) { //当滑轮向上滚动时
                    drt = -1;
                }
                if (e.wheelDelta < 0) { //当滑轮向下滚动时
                    drt = 1;
                }
                an += 0.6;
                scrollTop = listPanel.scrollTop;
                wheelPage();
            } else if (e.detail) {  //Firefox滑轮事件
                if (e.detail > 0) { //当滑轮向上滚动时
                    drt = -1;
                }
                if (e.detail < 0) { //当滑轮向下滚动时
                    drt = 1;
                }
                an += 0.6;
                scrollTop = listPanel.scrollTop;
                wheelPage();
            }
            if (drt != lastDrt) {
                an = 1.0;
                lastDrt = drt;
            }
            if (an > 20)
                an = 20;
        }
    }

    function setAudio(index) {
        if (index < 0 || index >= musicList.length)
            if (musicList.length == 0)
                return;
        musicIndex = index;
        playing_bk.style.top = listItems[musicIndex].offsetTop+"px";
        audio.src = musicList[musicIndex].url;
        audio.load();
        posterImg.src = musicList[musicIndex].poster;
        info_singer.textContent = musicList[musicIndex].singer;
        info_name.textContent = ((++index < 10) ? "[0" + index + "] " : "[" + index + "] ") + musicList[musicIndex].name;
        textDuration.textContent = musicList[musicIndex].time;
        textCurrentTime.textContent = "0:00";
        bufferProgress();
    }

    function setAudioPosition(scale) {
        if (audio == null || audio.duration == 0)
            return;
        if (audio.seekable)
            audio.currentTime = scale * audio.duration;
    }

    function setDurationText() {
        var time = parseInt(audio.duration);
        if (isNaN(time) || time == null)
            time = 0;
        textDuration.textContent = parseInt(time / 60) + ":" + (time % 60 < 10 ? '0' + time % 60 : "" + time % 60);
    }

    function setCurrentTimeText(scale) {
        var time = 0;
        if (audio.duration == undefined || isNaN(audio.duration))
            audio.duration = 0;
        time = parseInt(scale * audio.duration);
        if (isNaN(time) || time == null)
            time = 0;
        textCurrentTime.textContent = parseInt(time / 60) + ":" + (time % 60 < 10 ? '0' + time % 60 : "" + time % 60);
    }

    function setVolume(scale) {
        if (audio.volume) {
            audio.volume = scale;
            vol = scale;
            if (audio.muted)
                setMuted();
        }
    }

    function setMuted() {
        audio.muted = !audio.muted;
        btn_volIcon.setAttribute("class", audio.muted ? "btn-volume-off" : "btn-volume-on");
    }

    function playMusic() {
        if (musicList.length == 0)
            return;
        audio.play();
        audioCtlInterval = setInterval(function () {
            progressVol.setSpacePosition(vol);
            audio.volume = vol;
            if (audio.currentTime >= audio.duration) {
                ended();
            }
            progressMusic.setSpacePosition(audio.currentTime / audio.duration);
            setDurationText();
        }, 500);

        poster.setAttribute("style", "animation: anim_turn 10s infinite linear;");
        poster_btn.setAttribute("class", "poster-btn-pause");
        btn_playOrPause.setAttribute("class", "btn-pause-music");
        btn_playOrPause.setAttribute("title", "暂停");
    }

    function pauseMusic() {
        clearInterval(audioCtlInterval);
        audioCtlInterval = null;
        audio.pause();
        poster.setAttribute("style", "");
        poster_btn.setAttribute("class", "poster-btn-play");
        btn_playOrPause.setAttribute("class", "btn-play-music");
    }

    function stopMusic() {
        audio.pause();
        audio.currentTime = 0;
        progressMusic.setSpacePosition(0);
    }

    function lastSong() {
        if (musicList.length == 0)
            return;
        if (--musicIndex < 0)
            musicIndex = musicList.length - 1;
        setAudio(musicIndex);
        playMusic();
    }

    function nextSong() {
        if (musicList.length == 0)
            return;
        if (++musicIndex >= musicList.length)
            musicIndex = 0;
        setAudio(musicIndex);
        playMusic();
    }

    function bufferProgress() {
        var bufferTime = 0;
        var val = setInterval(function () {
            if (audio.buffered && audio.buffered.length) {
                bufferTime = audio.buffered.end(0);
                progressMusic.setLoadPosition(bufferTime / audio.duration);
                if (bufferTime == audio.duration)
                    clearInterval(val);
            }
        }, 500);

    }

    function initOnclick() {
        poster_btn.onclick = function () {
            if (poster_btn.getAttribute("class") == "poster-btn-pause") {
                pauseMusic();
            }
            else {
                playMusic();
            }
        }
        btn_lastSong.onclick = function () {
            lastSong();
        }
        btn_playOrPause.onclick = function () {
            if (btn_playOrPause.getAttribute("class") == "btn-play-music") {
                playMusic();
            }
            else {
                pauseMusic();
            }
        }
        btn_nextSong.onclick = function () {
            nextSong();
        }
        btn_volIcon.onclick = function () {
            setMuted();
            if (audio.muted == false)
                this.setAttribute("title", "静音");
            else
                this.setAttribute("title", "取消静音");
        }
        btn_setCycleMode.onclick = function () {
            var btnClass = ["list_play_mode_ordinal", "list_play_mode_loop", "list_play_mode_single", "list_play_mode_random"];
            var btnTitle = ["顺序播放", "列表循环", "单曲循环", "随机播放"];
            listCyclMode++;
            if (listCyclMode > 3)
                listCyclMode = 0;
            this.setAttribute("class", btnClass[listCyclMode]);
            this.setAttribute("title", btnTitle[listCyclMode]);
        }
        var cf_btns = document.getElementsByClassName("classify-item");
        for(var i = 0; i < cf_btns.length; i++){
            cf_btns[i].onclick = function(){
                getBaiduSongList(this.getAttribute("data"));
            }
        }
        var earchTextView = document.getElementById("search-input");
        document.getElementById("search-panel-btn").onclick = function(){
            var text = earchTextView.value;
            if(text != null && text.length > 0){
                search(text);
            }
        };
    }

    function initPlayer() {
        if (loaded)
            return;
        loaded = true;
        initListScroll();
        initOnclick();
    }

    function ended() {
        pauseMusic();
        audio.currentTime = 0;
        switch (listCyclMode) {
            case 0:
                if (musicIndex < musicList.length - 1)
                    nextSong();
                else
                    stopMusic();
                break;
            case 1:
                nextSong();
                break;
            case 2:
                audio.currentTime = 0;
                playMusic();
                break;
            case 3:
                musicIndex = parseInt(Math.random() * musicList.length);
                nextSong();
                break;
        }
    }

    function initMusicPage() {
        var musicPanel = document.getElementById("music-panel");
        var foot = document.getElementById("content");

        window.onresize = function () {
            if (musicPanel.offsetTop + musicPanel.offsetHeight > foot.offsetTop - 5)
                foot.style.visibility = "hidden";
            else
                foot.style.visibility = "visible";

        }
        getBaiduSongList(1);
        var startListener = setInterval(function(){
            if(dataIsLoaded == true){
                initMusicList();
                initMusicSide();
                initPlayer();
                setAudio(0);
                clearInterval(startListener);
            }
        }, 100);
    }
    initMusicPage();
}