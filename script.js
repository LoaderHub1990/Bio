// ---------- Profile info ----------
document.getElementById('avatar').src = 'Logo.png';
document.getElementById('username').textContent = '@flexozy';

// ---------- Music player ----------
const bgMusic = document.getElementById('bg-music');
const mutedIcon = document.getElementById('mute-icon');
const vinylDisc = document.getElementById('vinyl-disc');
const musicBars = document.querySelector('.music-bars');
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        bgMusic.pause();
        mutedIcon.classList.remove('fa-pause');
        mutedIcon.classList.add('fa-play');
        vinylDisc.classList.remove('spinning');
        musicBars.classList.remove('playing');
    } else {
        bgMusic.play().catch((err) => {
            console.warn('Playback blocked until user interacts with the page:', err);
        });
        mutedIcon.classList.remove('fa-play');
        mutedIcon.classList.add('fa-pause');
        vinylDisc.classList.add('spinning');
        musicBars.classList.add('playing');
    }
    isPlaying = !isPlaying;
}

// keep UI in sync if audio ends
bgMusic.addEventListener('ended', () => {
    isPlaying = false;
    mutedIcon.classList.remove('fa-pause');
    mutedIcon.classList.add('fa-play');
    vinylDisc.classList.remove('spinning');
    musicBars.classList.remove('playing');
});
