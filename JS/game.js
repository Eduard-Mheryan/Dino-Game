function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function checkOrientation() {
    if (window.innerWidth < window.innerHeight && isMobileDevice()) {
        document.getElementById('turnScreen').style.display = 'flex';
    } else {
        document.getElementById('turnScreen').style.display = 'none';
    }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('load', checkOrientation);