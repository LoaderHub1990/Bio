// ---------- Profile info ----------
document.getElementById('avatar').src = 'Logo.png';
document.getElementById('username').textContent = '@flexozy';

// ---------- Music player ----------
const bgMusic = document.getElementById('bg-music');
const muteIcon = document.getElementById('mute-icon');
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        bgMusic.pause();
        muteIcon.classList.remove('fa-volume-up');
        muteIcon.classList.add('fa-volume-mute');
    } else {
        bgMusic.play().catch((err) => {
            console.warn('Playback blocked until user interacts with the page:', err);
        });
        muteIcon.classList.remove('fa-volume-mute');
        muteIcon.classList.add('fa-volume-up');
    }
    isPlaying = !isPlaying;
}
