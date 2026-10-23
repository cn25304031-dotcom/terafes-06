document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !introActive && document.getElementById('intro').style.display !== 'none' && !document.getElementById('intro').classList.contains('out')) startIntro();
            if (e.key === 'Escape') skipIntro();
        });

        window.onload = function() {
            createStars();
            setDifficulty('easy');
            startWarp();   // ambient starfield behind the launch screen
            if (EMBEDDED) { document.documentElement.classList.add('embedded'); startIntro(); } // title page already had the PLAY click
        };

        // Inside index.html: "title" links close the game frame instead of navigating
        const EMBEDDED = window.self !== window.top;
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[data-home]');
            if (a && EMBEDDED) { e.preventDefault(); window.parent.postMessage({ type: 'arcade-exit' }, '*'); }
        });
    
