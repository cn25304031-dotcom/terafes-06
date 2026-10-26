"use strict";

// ---------- Banner ----------
function showBanner(sub, title, warn) {
    banner.querySelector("small").textContent = sub;
    banner.querySelector("b").textContent = title;
    banner.classList.toggle("warn", !!warn);
    banner.classList.remove("show"); void banner.offsetWidth; banner.classList.add("show");
}
