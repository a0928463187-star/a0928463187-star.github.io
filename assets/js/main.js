(() => {
  const normalize = (value) =>
    String(value ?? "")
      .trim()
      .toLocaleLowerCase("zh-Hant-TW")
      .replaceAll(/\s+/g, "");

  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector("#primary-nav");

  if (navToggle && primaryNav) {
    const closeNav = () => {
      navToggle.setAttribute("aria-expanded", "false");
      primaryNav.classList.remove("is-open");
    };

    navToggle.addEventListener("click", () => {
      const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(willOpen));
      primaryNav.classList.toggle("is-open", willOpen);
    });

    primaryNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 780) closeNav();
    });
  }

  document.querySelectorAll("[data-copy-url]").forEach((button) => {
    button.addEventListener("click", async () => {
      const status = document.querySelector("[data-copy-status]");
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (status) status.textContent = "已複製本頁連結";
      } catch {
        if (status) status.textContent = "無法自動複製，請使用瀏覽器網址列";
      }
      window.setTimeout(() => {
        if (status) status.textContent = "";
      }, 3200);
    });
  });

  const timeline = document.querySelector("[data-timeline-track]");
  if (timeline) {
    const cards = [...timeline.querySelectorAll(".timeline-item")];
    const previous = document.querySelector("[data-timeline-prev]");
    const next = document.querySelector("[data-timeline-next]");
    const position = document.querySelector("[data-timeline-position]");
    const desktop = window.matchMedia("(min-width: 781px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pointerStart = null;
    let lastPosition = 0;

    const nearestCard = () => {
      const start = timeline.scrollLeft;
      return cards.reduce((best, card, index) =>
        Math.abs(card.offsetLeft - start) <
        Math.abs(cards[best].offsetLeft - start) ? index : best, 0);
    };

    const updateControls = () => {
      if (!desktop.matches) return;
      lastPosition = nearestCard();
      if (position) position.textContent = `第 ${lastPosition + 1} / ${cards.length} 段`;
      if (previous) previous.disabled = lastPosition === 0;
      if (next) next.disabled = lastPosition === cards.length - 1;
    };

    const showCard = (index) => {
      if (!desktop.matches) return;
      const target = Math.max(0, Math.min(cards.length - 1, index));
      timeline.scrollTo({
        left: cards[target].offsetLeft,
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
      lastPosition = target;
      if (position) position.textContent = `第 ${target + 1} / ${cards.length} 段`;
      if (previous) previous.disabled = target === 0;
      if (next) next.disabled = target === cards.length - 1;
    };

    previous?.addEventListener("click", () => showCard(lastPosition - 1));
    next?.addEventListener("click", () => showCard(lastPosition + 1));
    timeline.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    timeline.addEventListener("keydown", (event) => {
      if (!desktop.matches || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      showCard(lastPosition + (event.key === "ArrowRight" ? 1 : -1));
    });

    timeline.addEventListener("pointerdown", (event) => {
      if (!desktop.matches || event.pointerType !== "mouse" || event.button !== 0) return;
      pointerStart = { x: event.clientX, scrollLeft: timeline.scrollLeft };
      timeline.setPointerCapture(event.pointerId);
    });
    timeline.addEventListener("pointermove", (event) => {
      if (!pointerStart) return;
      const delta = event.clientX - pointerStart.x;
      if (Math.abs(delta) < 4 && !timeline.classList.contains("is-dragging")) return;
      timeline.classList.add("is-dragging");
      timeline.scrollLeft = pointerStart.scrollLeft - delta;
      event.preventDefault();
    });
    const finishDrag = () => {
      if (!pointerStart) return;
      pointerStart = null;
      timeline.classList.remove("is-dragging");
      updateControls();
    };
    timeline.addEventListener("pointerup", finishDrag);
    timeline.addEventListener("pointercancel", finishDrag);
    timeline.addEventListener("lostpointercapture", finishDrag);
    updateControls();
  }

  const gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    const cards = [...gallery.querySelectorAll("[data-category]")];
    const buttons = [...document.querySelectorAll("[data-filter]")];
    const search = document.querySelector("[data-gallery-search]");
    const count = document.querySelector("[data-gallery-count]");
    const empty = document.querySelector("[data-gallery-empty]");
    let activeCategory = "全部";

    const applyGalleryFilters = () => {
      const query = normalize(search?.value);
      let visible = 0;
      cards.forEach((card) => {
        const categoryMatch = activeCategory === "全部" || card.dataset.category === activeCategory;
        const searchMatch = !query || normalize(card.dataset.search).includes(query);
        const show = categoryMatch && searchMatch;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = `顯示 ${visible} 筆`;
      if (empty) empty.hidden = visible !== 0;
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.filter;
        buttons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        applyGalleryFilters();
      });
    });

    search?.addEventListener("input", applyGalleryFilters);
  }

  const dialog = document.querySelector("#credential-dialog");
  if (dialog) {
    const image = dialog.querySelector("[data-dialog-image]");
    const title = dialog.querySelector("#dialog-title");
    const reference = dialog.querySelector("[data-dialog-reference]");
    let lastTrigger = null;

    document.querySelectorAll(".credential-open").forEach((button) => {
      button.addEventListener("click", () => {
        lastTrigger = button;
        const itemTitle = button.dataset.title ?? "紀錄原圖";
        image.src = button.dataset.full;
        image.alt = `${itemTitle}原圖`;
        title.textContent = itemTitle;

        if (button.dataset.referenceUrl) {
          reference.href = button.dataset.referenceUrl;
          reference.textContent = `${button.dataset.referenceLabel} ↗`;
          reference.hidden = false;
        } else {
          reference.removeAttribute("href");
          reference.hidden = true;
        }

        document.body.classList.add("dialog-open");
        dialog.showModal();
      });
    });

    const closeDialog = () => {
      if (dialog.open) dialog.close();
    };

    dialog.querySelector("[data-dialog-close]")?.addEventListener("click", closeDialog);
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog.open) {
        event.preventDefault();
        closeDialog();
      }
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      const outside =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;
      if (outside) closeDialog();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      image.removeAttribute("src");
      image.alt = "";
      lastTrigger?.focus();
    });
  }

  const faqSearch = document.querySelector("[data-faq-search]");
  if (faqSearch) {
    const groups = [...document.querySelectorAll("[data-faq-group]")];
    const items = [...document.querySelectorAll("[data-faq-item]")];
    const count = document.querySelector("[data-faq-count]");
    const empty = document.querySelector("[data-faq-empty]");

    const applyFaqFilter = () => {
      const query = normalize(faqSearch.value);
      let visible = 0;
      groups.forEach((group) => {
        let groupVisible = 0;
        group.querySelectorAll("[data-faq-item]").forEach((item) => {
          const show = !query || normalize(item.dataset.search).includes(query);
          item.hidden = !show;
          if (show) {
            groupVisible += 1;
            visible += 1;
          } else {
            item.removeAttribute("open");
          }
        });
        group.hidden = groupVisible === 0;
      });
      if (count) count.textContent = `顯示 ${visible} 題`;
      if (empty) empty.hidden = visible !== 0;
    };

    faqSearch.addEventListener("input", applyFaqFilter);

    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        const group = item.closest("[data-faq-group]");
        group?.querySelectorAll("[data-faq-item][open]").forEach((other) => {
          if (other !== item) other.removeAttribute("open");
        });
      });
    });
  }
})();
