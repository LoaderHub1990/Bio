// ---------- Profile info ----------
document.getElementById('avatar').src = 'Logo.png';
document.getElementById('username').textContent = '@flexozy';

// ---------- Music player (click anywhere on the card to toggle) ----------
const bgMusic = document.getElementById('bg-music');
const player = document.getElementById('music-player');
const vinylDisc = document.getElementById('vinyl-disc');
const musicBars = document.getElementById('music-bars');
const playerStatus = document.getElementById('player-status');
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        bgMusic.pause();
        setPlayingUI(false);
    } else {
        bgMusic.play().catch((err) => {
            console.warn('Playback blocked until user interacts with the page:', err);
        });
        setPlayingUI(true);
    }
    isPlaying = !isPlaying;
}

function setPlayingUI(playing) {
    player.classList.toggle('is-playing', playing);
    vinylDisc.classList.toggle('spinning', playing);
    musicBars.classList.toggle('playing', playing);
    playerStatus.textContent = playing ? 'Now Playing' : 'Tap to play';
}

bgMusic.addEventListener('ended', () => {
    isPlaying = false;
    setPlayingUI(false);
});

// ---------- Animate skill bars in on load ----------
window.addEventListener('DOMContentLoaded', () => {
    const bars = document.querySelectorAll('.progress-bar');
    bars.forEach((bar) => {
        const target = bar.style.width;
        bar.style.width = '0%';
        requestAnimationFrame(() => {
            setTimeout(() => {
                bar.style.width = target;
            }, 150);
        });
    });
});
