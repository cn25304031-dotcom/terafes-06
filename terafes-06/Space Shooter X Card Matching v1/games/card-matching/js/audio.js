        // Web Audio API による即時効果音（ファイル読み込み不要）
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playSound(type) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;
            if (type === 'flip') {
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
                osc.start(now); osc.stop(now + 0.08);
            } else if (type === 'match') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.08);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
                osc.start(now); osc.stop(now + 0.25);
            } else if (type === 'combo') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(587.33, now);
                osc.frequency.setValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
            } else if (type === 'bomb') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
            } else if (type === 'over') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.5);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.start(now); osc.stop(now + 0.5);
            }
        }

        
