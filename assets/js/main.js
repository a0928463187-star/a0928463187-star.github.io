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
        window.prompt("請複製下方網址", window.location.href);
        if (status) status.textContent = "已顯示可複製網址";
      }
      window.setTimeout(() => {
        if (status) status.textContent = "";
      }, 3200);
    });
  });

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

    document.querySelectorAll(".credential-open").forEach((button) => {
      button.addEventListener("click", () => {
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

        dialog.showModal();
      });
    });

    const closeDialog = () => {
      dialog.close();
      image.removeAttribute("src");
      image.alt = "";
    };

    dialog.querySelector("[data-dialog-close]")?.addEventListener("click", closeDialog);
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
      image.removeAttribute("src");
      image.alt = "";
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
