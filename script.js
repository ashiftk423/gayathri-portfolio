(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  if (root.classList.contains("is-booting")) {
    window.setTimeout(function () {
      root.classList.add("is-ready");
    }, 1050);
  }

  const clock = document.getElementById("clock");
  function tick() {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  tick();
  window.setInterval(tick, 30000);

  const header = document.getElementById("header");
  const progress = document.getElementById("progress");
  const sections = ["work", "path", "range", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-stuck", y > 8);
    const menuOpen = document.body.classList.contains("menu-open");
    header.classList.toggle("is-hidden", !menuOpen && y > lastY && y > 140);
    lastY = y;

    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (height > 0 ? (y / height) * 100 : 0) + "%";

    let current = "";
    sections.forEach(function (section) {
      if (section.offsetTop <= y + 140) current = section.id;
    });
    document.querySelectorAll(".nav a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (root.classList.contains("js") && !reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll("[data-reveal], .timeline").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll("[data-reveal], .timeline").forEach(function (el) {
      el.classList.add("in");
    });
  }

  const labels = {
    print: "Ksetra Printing",
    park: "Car Parking Management",
    rent: "House Rental Management",
    desk: "Vehicle Helpdesk"
  };
  const screenRoot = document.querySelector(".device-screen");
  const label = document.getElementById("device-label");
  const live = document.getElementById("live");
  const items = Array.prototype.slice.call(document.querySelectorAll(".work-item"));

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach(function (screen) {
      screen.classList.toggle("is-on", screen.dataset.screen === name);
    });
    if (screenRoot) screenRoot.classList.toggle("is-dark", name === "park");
    if (label) label.textContent = labels[name] || name;
    if (live) live.textContent = "Showing " + (labels[name] || name);
    items.forEach(function (item) {
      const on = item.dataset.screen === name;
      item.classList.toggle("is-active", on);
      if (on) item.setAttribute("aria-current", "true");
      else item.removeAttribute("aria-current");
    });
  }

  items.forEach(function (item) {
    function activate() { showScreen(item.dataset.screen); }
    item.addEventListener("mouseenter", activate);
    item.addEventListener("focus", activate);
    item.addEventListener("click", activate);
  });

  const workList = document.querySelector(".work-list");
  if (workList) {
    workList.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const index = items.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = items[index + (event.key === "ArrowDown" ? 1 : -1)];
      if (next) next.focus();
    });
  }

  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menu-btn");
  const menuLabel = menuBtn.querySelector(".menu-label");

  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("menu-open", open);
    header.classList.remove("is-hidden");
  }

  menuBtn.addEventListener("click", function () {
    setMenu(menu.hidden);
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !menu.hidden) setMenu(false);
  });

  const form = document.getElementById("note-form");
  const hint = document.getElementById("form-hint");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const note = document.getElementById("note").value.trim();
    const subject = encodeURIComponent("A role for Gayathri VR");
    const body = encodeURIComponent(note || "Hello Gayathri,\n\n");
    window.location.href = "mailto:gayathrimini5@gmail.com?subject=" + subject + "&body=" + body;
  });

  document.getElementById("copy-email").addEventListener("click", async function () {
    const address = "gayathrimini5@gmail.com";
    try {
      await navigator.clipboard.writeText(address);
      hint.textContent = "Email copied.";
      hint.classList.add("is-ok");
    } catch (error) {
      hint.textContent = "Copy is blocked here. The address is " + address + ".";
      hint.classList.remove("is-ok");
    }
  });

  const device = document.getElementById("device");
  const cursor = document.getElementById("cursor");
  if (fine && !reduce) {
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let started = false;

    window.addEventListener("pointermove", function (event) {
      x = event.clientX;
      y = event.clientY;
      const hot = event.target.closest("a, button, textarea");
      cursor.classList.toggle("is-hot", Boolean(hot));
      if (device) {
        const dx = (x / window.innerWidth - 0.5) * 14;
        const dy = (y / window.innerHeight - 0.5) * 10;
        device.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0)";
      }
      if (!started) {
        cx = x;
        cy = y;
        started = true;
        requestAnimationFrame(follow);
      }
    });

    function follow() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px, " + cy + "px)";
      requestAnimationFrame(follow);
    }
  }

  if (!reduce) {
    const herd = [
      { el: document.querySelector(".cat-walk"), x: -80, dir: 1, pace: "walk", speed: 32, until: 0, runChance: 0.42, walk: [24, 20], run: [130, 45], walkFor: [3200, 3800], runFor: [1100, 900] },
      { el: document.querySelector(".dog-walk"), x: Math.min(window.innerWidth * 0.7, 980), dir: -1, pace: "walk", speed: 26, until: 0, runChance: 0.28, walk: [20, 14], run: [68, 22], walkFor: [3800, 2800], runFor: [1300, 700] },
      { el: document.querySelector(".bunny-hop"), x: Math.min(window.innerWidth * 0.28, 360), dir: 1, pace: "walk", speed: 16, until: 0, runChance: 0.34, walk: [12, 8], run: [46, 16], walkFor: [3600, 2400], runFor: [1400, 600] }
    ].filter(function (pet) { return pet.el; });

    let last = performance.now();
    function roam(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const span = window.innerWidth + 180;
      herd.forEach(function (pet) {
        if (now >= pet.until) {
          const nextRun = pet.pace !== "run" && Math.random() < pet.runChance;
          pet.pace = nextRun ? "run" : "walk";
          const band = pet.pace === "run" ? pet.run : pet.walk;
          const hold = pet.pace === "run" ? pet.runFor : pet.walkFor;
          pet.speed = band[0] + Math.random() * band[1];
          pet.until = now + hold[0] + Math.random() * hold[1];
          pet.el.classList.toggle("is-run", pet.pace === "run");
        }
        pet.x += pet.dir * pet.speed * dt;
        if (pet.dir > 0 && pet.x > span) pet.x = -150;
        if (pet.dir < 0 && pet.x < -150) pet.x = span;
        pet.el.style.transform = "translate3d(" + pet.x + "px, 0, 0)";
      });
      requestAnimationFrame(roam);
    }
    if (herd.length) requestAnimationFrame(roam);
  }
})();
