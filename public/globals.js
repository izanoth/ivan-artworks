if (typeof window !== 'undefined') {


    const audioPlayer = document.getElementById('audio-player');
    const trackList = document.querySelectorAll('.track');
    let currentTrackButton = null;

    function playTrack(trackSrc, playIcon, button) {
        audioPlayer.src = trackSrc;
        audioPlayer.play();
        button.innerHTML = `<span class="bi bi-pause-circle"></span>`;
        button.dataset.playing = 'true';
        audioPlayer.addEventListener('ended', function () {
            pauseTrack(playIcon, button);
        });
    }

    function pauseTrack(playIcon, button) {
        audioPlayer.pause();
        button.innerHTML = `<span class="bi bi-play-circle"></span>`;
        button.dataset.playing = 'false';
    }

    function handlePlayButtonClick(event) {
        console.log('here');
        const button = event.currentTarget;
        const trackSrc = button.parentNode.getAttribute('data-src');
        const playing = button.dataset.playing === 'true';

        if (playing) {
            pauseTrack('bi-play-circle', button);
        } else {
            if (currentTrackButton) {
                const currentTrackPlaying = currentTrackButton.dataset.playing === 'true';
                if (currentTrackPlaying) {
                    pauseTrack('bi-play-circle', currentTrackButton);
                }
            }

            playTrack(trackSrc, 'bi-play-circle', button);
            currentTrackButton = button;
        }
    }

    function init() {
        trackList.forEach(track => {
            console.log(track);
            console.log(track.innerHTML);

            const playButton = track.querySelector('.play-button');
            playButton.addEventListener('click', handlePlayButtonClick);
        });
    }
    
    init();
   
    
};
