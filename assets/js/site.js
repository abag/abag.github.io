// Small progressive enhancements shared by every page.
(() => {
  "use strict";
  // Email address: assembled here so it is not sitting in the HTML for scrapers.
  document.querySelectorAll(".email").forEach((el) => {
    const addr = `${el.dataset.u}@${el.dataset.d}`;
    const a = document.createElement("a");
    a.href = `mailto:${addr}`; a.textContent = addr;
    el.replaceChildren(a);
    const btn = el.nextElementSibling;
    if (btn && btn.classList.contains("copy-email") && navigator.clipboard) {
      btn.hidden = false;
      btn.addEventListener("click", () => copy(addr, btn));
    }
  });

  document.querySelectorAll(".copy-bib").forEach((btn) => {
    if (!navigator.clipboard) { btn.hidden = true; return; }
    btn.addEventListener("click", () => copy(btn.previousElementSibling.textContent, btn));
  });

  function copy(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const old = btn.textContent; btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = old; }, 1500);
    });
  }

  // Publication theme filter
  const filter = document.querySelector(".pub-filter");
  if (filter) {
    filter.hidden = false;
    const buttons = filter.querySelectorAll("button");
    buttons.forEach((b) => b.addEventListener("click", () => {
      const f = b.dataset.filter;
      buttons.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
      document.querySelectorAll(".year-group[data-year]").forEach((g) => {
        let shown = 0;
        g.querySelectorAll(".pub").forEach((p) => {
          const on = f === "all" || p.dataset.theme === f;
          p.hidden = !on; if (on) shown++;
        });
        g.hidden = shown === 0;
      });
    }));
  }
})();
