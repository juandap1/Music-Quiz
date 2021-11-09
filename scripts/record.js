var playBtn = document.getElementById('playBtn');
var audioBuffer, analyzer, frequency, soundsrc, isPlaying = false;
var i = 0;
var max = 255;
var rot = 0;
var omega = 0;
var color = 'rgb(' + Math.floor(Math.random() * max) + ', ' + Math.floor(Math.random() * max) + ', ' + Math.floor(Math.random() * max) + ')';
function init() {
    var context = getAudioContext();
    if (context) {
        d3.select('#playBtn')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('defs');

        var radial = d3.select('defs').append('radialGradient')
            .attr('id', 'gradient')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%')
            .attr('fx', '50%')
            .attr('fy', '50%');

        radial.append('stop')
            .attr('offset', '80%')
            .style('stop-color', 'rgb(0,0,0)')
            .style('stop-opacity', 0);
        radial.append('stop')
            .attr('offset', '90%')
            .attr('id', 'colored')
            .style('stop-color', '#00bfff')
            .style('stop-opacity', 1);
        radial.append('stop')
            .attr('offset', '100%')
            .style('stop-color', 'rgb(0,0,0)')
            .style('stop-opacity', 0);
        $('.mbtn').mouseover(function() {
            if (!isPlaying) {
                $('.mbtn').css('opacity', '0.2');
                $('.mbtn').css('cursor', 'pointer');
                $('#record').css('transform', 'translateX(-50%) rotate(' + rot + 'deg) scale(1.05, 1.05)');
            }
        });

        $('.mbtn').mouseout(function() {
            $('.mbtn').css('opacity', '1');
            $('.record').css('transform', 'translateX(-50%) rotate(' + rot + 'deg) scale(1, 1)');
        });
        
    } else {
        alert('Audio API not supported in current browser.');
    }
}

function getAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if (window.AudioContext) {
    return new AudioContext();
    }
    return null;
}

function loadSound(context, url) {
    console.log(url);
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            if(!isPlaying){
                var initial = 0;
                if (buffer.duration > 5) {
                    initial = buffer.duration/2;
                }
                playSound(context, buffer, 0, url, initial);
                document.getElementById("note").style.display = "block";
                document.getElementById("play").style.display = "none";
            }
        }, onLoadSoundError);
    }
    request.send();
}

function loadSound2(context, url, start, initial) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            if(!isPlaying){
                if (start < (initial + 30) && buffer.duration > start) {
                    playSound(context, buffer, start, url, initial);
                    document.getElementById("note").style.display = "block";
                    document.getElementById("play").style.display = "none";
                }
            }
        }, onLoadSoundError);
    }
    request.send();
}

function onLoadSoundError(e) {
    alert('Sound file could not be loaded.');
}

function deleteFile(URL) {
    fetch(`http://localhost:8000/delete?URL=${URL}`, {
        method:'GET'
    }).then(res => res.json())
    .then(json => console.log(json.result));
}

function playSound(context, buffer, start, url, begin) {
    if (!isPlaying) {
        $('.mbtn').css('opacity', '1');
        $('.record').css('transform', 'translateX(-50%) rotate(' + rot + 'deg) scale(1, 1)');
        $('.mbtn').css('cursor', 'default');
        playBtn.className = 'stop';
        isPlaying = true;
        //playBtn.style.display = 'none';
        soundsrc = context.createBufferSource();
        analyzer = context.createAnalyser();
        frequency = new Uint8Array(analyzer.frequencyBinCount);

        soundsrc.buffer = buffer;
        soundsrc.connect(context.destination);
        soundsrc.connect(analyzer);
        soundsrc.addEventListener('ended', function(){
            stopSound();
            console.log(buffer);
            if ((buffer.duration-begin) < 30) {
                loadSound2(context, url, buffer.duration, begin);
            } else {
                deleteFile(url);
            }
        });
        soundsrc.start(0, start + begin, (30 + begin)-start);
        if (start == 0) {
            render();
        }
    }
}

function stopSound(){
    soundsrc.stop();
    isPlaying = false;
    playBtn.className = '';
}

function render() {
    if (i % 20 == 0) {
        color = 'rgb(' + Math.floor(Math.random() * max) + ', ' + Math.floor(Math.random() * max) + ', ' + Math.floor(Math.random() * max) + ')';
    }
    d3.select('.record').style('transform', 'translateX(-50%) rotate(' + rot + 'deg)');
    if (omega > 0 || isPlaying) {
        requestAnimationFrame(render);
    }
    analyzer.getByteFrequencyData(frequency);
    d3.select('#colored').style('stop-color', color);

    d3.select('#playBtn').select('svg').selectAll('circle')
    .data(frequency.slice(0, 10))
    .attr('r', function(d) {
        return ((d / 255) * 50) + '%';
    })
    .enter().append('circle')
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('fill', 'url(#gradient)');
    i++;
    if (isPlaying) {
        if (omega <= 10) {
            omega += 0.1;
        }
    } else {
        if (omega > 0) {
            omega -= 0.1;
        } else {
            omega = 0;
        }
    }
    rot+=omega;
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}