// ===== INTRO CINEMATIC (~12s, skippable) =====
        const INTRO_MS = 12300;
        let introTimers = [], introActive = false, warpRAF = null, warpSpeed = 2, warpTarget = 2;

        function introSound(type) {
            try {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t = audioCtx.currentTime;
                o.connect(g); g.connect(audioCtx.destination);
                if (type === 'whoosh') { o.type='sawtooth'; o.frequency.setValueAtTime(60,t); o.frequency.exponentialRampToValueAtTime(700,t+.9); g.gain.setValueAtTime(.001,t); g.gain.linearRampToValueAtTime(.12,t+.4); g.gain.linearRampToValueAtTime(.001,t+.9); o.start(t); o.stop(t+.9); }
                else if (type === 'tick') { o.type='sine'; o.frequency.setValueAtTime(660,t); g.gain.setValueAtTime(.2,t); g.gain.exponentialRampToValueAtTime(.001,t+.25); o.start(t); o.stop(t+.25); }
                else if (type === 'blip') { o.type='square'; o.frequency.setValueAtTime(900,t); g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+.09); o.start(t); o.stop(t+.09); }
                else if (type === 'chime') { o.type='triangle'; o.frequency.setValueAtTime(784,t); o.frequency.setValueAtTime(1175,t+.09); g.gain.setValueAtTime(.2,t); g.gain.exponentialRampToValueAtTime(.001,t+.35); o.start(t); o.stop(t+.35); }
                else if (type === 'collect') { o.type='sine'; o.frequency.setValueAtTime(400,t); o.frequency.exponentialRampToValueAtTime(900,t+.2); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.25); o.start(t); o.stop(t+.25); }
                else if (type === 'go') { o.type='triangle'; o.frequency.setValueAtTime(523,t); o.frequency.setValueAtTime(784,t+.1); o.frequency.setValueAtTime(1047,t+.2); g.gain.setValueAtTime(.25,t); g.gain.exponentialRampToValueAtTime(.001,t+.6); o.start(t); o.stop(t+.6); }
            } catch (e) {}
        }

        // Warp-speed starfield
        function startWarp() {
            const cv = document.getElementById('warp'), ctx = cv.getContext('2d');
            const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
            resize(); window.onresize = resize;
            const stars = Array.from({ length: 220 }, () => ({ x: (Math.random()-.5)*2, y: (Math.random()-.5)*2, z: Math.random()*1.5+.1, px: null, py: null }));
            (function loop() {
                warpSpeed += (warpTarget - warpSpeed) * 0.04;
                ctx.fillStyle = 'rgba(3,5,13,0.35)'; ctx.fillRect(0, 0, cv.width, cv.height);
                const cx = cv.width/2, cy = cv.height/2, k = Math.max(cv.width, cv.height) * 0.6;
                for (const st of stars) {
                    st.z -= warpSpeed * 0.0035;
                    if (st.z <= 0.02) { st.x=(Math.random()-.5)*2; st.y=(Math.random()-.5)*2; st.z=1.5; st.px=null; }
                    const sx = cx + st.x / st.z * k * 0.5, sy = cy + st.y / st.z * k * 0.5;
                    const a = Math.min(1, (1.5 - st.z) * 1.2);
                    ctx.strokeStyle = `rgba(190,230,255,${a})`; ctx.lineWidth = Math.max(.6, (1.5 - st.z) * 1.8);
                    ctx.beginPath(); ctx.moveTo(st.px ?? sx, st.py ?? sy); ctx.lineTo(sx, sy); ctx.stroke();
                    st.px = sx; st.py = sy;
                }
                warpRAF = requestAnimationFrame(loop);
            })();
        }
        function stopWarp() { cancelAnimationFrame(warpRAF); warpRAF = null; }

        function showScene(n) {
            document.querySelectorAll('#intro .scene').forEach((el, i) => el.classList.toggle('show', i === n));
        }
        function at(ms, fn) { introTimers.push(setTimeout(fn, ms)); }
        const $i = (id) => document.getElementById(id);
        const rnd = (a, b) => a + Math.random() * (b - a);

        // ---- scattered-card story helpers ----
        const INTRO_ICONS = ['🚀', '🪐', '🛸', '👽', '🌙', '⭐', '🌍', '☄️'];
        const ic = { cards: [], cs: 80, ss: 40, collected: 0 };

        function icPlace(c, x, y, r, s, t) {
            c.x = x; c.y = y;
            c.el.style.setProperty('--t', t + 's');
            c.el.style.transform = `translate(${x - ic.cs / 2}px, ${y - ic.cs / 2}px) rotate(${r}deg) scale(${s})`;
        }
        function icSeek(x, y, t) {
            const s = $i('seeker');
            s.style.setProperty('--t', t + 's');
            s.style.transform = `translate(${x - 32}px, ${y - 32}px)`;
        }
        function icSlot(i) {
            const r = $i('tray').children[i].getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        function icCap(t, s, j) {
            $i('cap-t').textContent = t; $i('cap-s').textContent = s; $i('cap-j').textContent = j;
            const box = $i('cap'); box.classList.remove('cap-anim'); void box.offsetWidth; box.classList.add('cap-anim');
        }
        function icBurst(x, y) {
            const b = document.createElement('div');
            b.className = 'burst'; b.style.left = x + 'px'; b.style.top = y + 'px';
            b.innerHTML = '<span>MATCH!</span>' + Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36}deg"></i>`).join('');
            $i('cardfield').appendChild(b);
            setTimeout(() => b.remove(), 1000);
        }

        // 16 cards (8 pairs) burst out of the centre and tumble around the screen
        function icBuild() {
            const W = innerWidth, H = innerHeight;
            ic.cs = Math.round(Math.max(54, Math.min(104, Math.min(W, H) * 0.14)));
            ic.ss = Math.round(Math.max(28, Math.min(54, (W - 70) / 9.2)));
            ic.collected = 0;
            const root = $i('intro');
            root.style.setProperty('--cs', ic.cs + 'px'); root.style.setProperty('--ss', ic.ss + 'px');
            const tray = $i('tray'); tray.className = ''; tray.innerHTML = '<i class="slot"></i>'.repeat(16);
            const field = $i('cardfield'); field.innerHTML = '';
            $i('seeker').classList.remove('show');
            ic.cards = [];
            INTRO_ICONS.forEach((icon, p) => [0, 1].forEach(() => {
                const el = document.createElement('div');
                el.className = 'ic';
                el.style.zIndex = 1 + Math.floor(Math.random() * 10);
                el.innerHTML = `<div class="ic-in" style="animation-duration:${rnd(2.4, 4.4).toFixed(2)}s;animation-delay:-${rnd(0, 3).toFixed(2)}s"><div class="flipper"><div class="f"><span class="ilogo">${icon}</span></div><div class="b"><i class="fa-solid fa-atom"></i></div></div></div>`;
                field.appendChild(el);
                const c = { el, p, x: W / 2, y: H / 2 };
                icPlace(c, W / 2, H * 0.5, 0, 0, 0);
                ic.cards.push(c);
            }));
            void field.offsetWidth;
            const capBottom = $i('cap').getBoundingClientRect().bottom;
            const yMin = capBottom + ic.cs * 0.55;
            const yMax = Math.max(yMin + 40, tray.getBoundingClientRect().top - ic.cs * 0.6);
            [...ic.cards].sort(() => Math.random() - 0.5).forEach((c, i) =>
                at(120 + i * 55, () => icPlace(c, rnd(ic.cs * 0.7, W - ic.cs * 0.7), rnd(yMin, yMax), rnd(-70, 70), rnd(0.8, 1.25), 1.1)));
        }

        // The player's cursor finds a card, finds its twin, they merge and are collected
        function icMatch(p, f) {
            const [A, B] = ic.cards.filter((c) => c.p === p);
            let mx = 0, my = 0;
            icSeek(A.x, A.y, 0.38 * f);
            at(400 * f, () => { A.el.classList.add('pick'); introSound('blip'); icSeek(B.x, B.y, 0.38 * f); });
            at(800 * f, () => {
                B.el.classList.add('pick'); introSound('blip');
                mx = (A.x + B.x) / 2; my = (A.y + B.y) / 2;
                const off = ic.cs * 0.58;
                A.el.style.zIndex = B.el.style.zIndex = 20;
                icPlace(A, mx - off, my, -6, 1.15, 0.35 * f);
                icPlace(B, mx + off, my, 6, 1.15, 0.35 * f);
            });
            at(1200 * f, () => {
                icBurst(mx, my); introSound('chime');
                [A, B].forEach((c) => { c.el.classList.remove('pick'); c.el.classList.add('done'); });
            });
            at(1500 * f, () => {
                [A, B].forEach((c, k) => {
                    const s = icSlot(k * 8 + p);
                    c.el.classList.add('settled');
                    icPlace(c, s.x, s.y, 0, ic.ss / ic.cs, 0.65);
                });
                introSound('collect');
                ic.collected++;
                $i('intro-count').textContent = `${ic.collected} / 8`;
            });
        }

        function startIntro() {
            if (introActive) return;
            introActive = true;
            const cfg = DIFFICULTY_SETTINGS[currentDifficulty];
            const rules = `⏱ ${cfg.time}s  ·  🔥 COMBO = BONUS` + (cfg.hasBomb ? '  ·  💣 BOMB = -5s' : '');
            const intro = $i('intro');
            intro.classList.add('playing');
            if (!warpRAF) startWarp();
            warpTarget = 4; introSound('whoosh');
            showScene(-1);

            $i('intro-count').textContent = ''; $i('intro-rules').textContent = '';
            icCap('SIGNAL LOST', 'The star-cards have been scattered across space…', '星のカードが宇宙に散らばってしまった…');
            icBuild();                                              // 0.0s  cards scatter in a mess

            at(2900, () => { icSeek(innerWidth / 2, innerHeight * 0.5, 0); $i('seeker').classList.add('show'); });
            at(3000, () => {                                        // 3.0s  player starts searching
                icCap('FIND THE PAIRS', 'Spot two identical cards.', '同じカードを見つけよう');
                $i('intro-count').textContent = '0 / 8'; introSound('whoosh');
            });
            [3200, 4200, 5200].forEach((ms, k) => at(ms, () => icMatch(k, 1)));            // slow, readable matches
            at(5900, () => icCap('COLLECT THEM ALL', 'Match every pair to bring order back.', 'ペアを揃えて全部集めよう'));
            [3, 4, 5, 6, 7].forEach((p, k) => at(6000 + k * 420, () => icMatch(p, 0.5)));  // faster chain
            at(8600, () => $i('seeker').classList.remove('show'));

            at(9150, () => {                                        // 9.15s order restored
                ic.cards.forEach((c) => c.el.classList.add('flipcard'));
                $i('tray').classList.add('restored'); introSound('chime');
                icCap('ORDER RESTORED', 'All star-cards recovered. Time to play!', '秩序が戻った — ゲーム開始！');
                $i('intro-count').textContent = '8 / 8'; $i('intro-rules').textContent = rules;
                warpTarget = 12;
            });
            const num = $i('count-num');
            [['3', 9500], ['2', 10250], ['1', 11000], ['GO!', 11750]].forEach(([tx, ms]) => at(ms, () => {
                num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
                num.textContent = tx; introSound(tx === 'GO!' ? 'go' : 'tick');
                if (tx === 'GO!') warpTarget = 45;
            }));
            at(INTRO_MS, endIntro);
        }

        function skipIntro() { if (introActive) endIntro(); }

        function endIntro() {
            if (!introActive) return;
            introActive = false;
            introTimers.forEach(clearTimeout); introTimers = [];
            const intro = document.getElementById('intro');
            intro.classList.add('out');
            resetGame();                                    // fresh shuffled board
            const board = document.getElementById('game-board');
            [...board.children].forEach((c, i) => c.style.setProperty('--i', i));
            board.classList.add('dealing');
            setTimeout(() => board.classList.remove('dealing'), 1800);
            setTimeout(() => { intro.style.display = 'none'; stopWarp(); $i('cardfield').innerHTML = ''; }, 650);
        }

        
