(() => {
  "use strict";

  const REPOSITORY_PATH = "/zufarrizal/LiveFlowStudio-Releases";
  const LATEST_RELEASE_URL = `https://github.com${REPOSITORY_PATH}/releases/latest`;
  const RELEASE_DATA_URL = "data/release.json";
  const PRODUCT_DATA_URL = "data/product.json";
  const CHECKSUM_PATTERN = /^[a-f0-9]{64}$/i;
  const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
  const ICON_PATHS = {
    activity: "M4 12h3l2-6 4 12 2-6h5",
    sliders: "M4 7h7M15 7h5M4 17h5M13 17h7M11 4v6M9 14v6",
    bolt: "m13 2-9 12h7l-1 8 9-12h-7z",
    screen: "M3 3h18v14H3zM8 21h8M12 17v4M7 12l3-3 3 3 4-5",
    file: "M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6",
    database: "M4 5c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5m-16 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
    chevron: "m6 9 6 6 6-6",
  };

  const queryAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const isNonEmptyText = (value) => typeof value === "string" && value.trim().length > 0;
  const menuButton = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-navigation]");
  const header = document.querySelector("[data-header]");
  const releaseStatus = document.querySelector("[data-release-status]");
  const copyStatus = document.querySelector("[data-copy-status]");

  const closeNavigation = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
  };

  menuButton?.addEventListener("click", () => {
    const opening = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(opening));
    navigation?.classList.toggle("open", opening);
  });

  navigation?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeNavigation();
  });

  document.addEventListener("click", (event) => {
    if (!navigation?.classList.contains("open")) return;
    if (event.target instanceof Node && !navigation.contains(event.target) && !menuButton?.contains(event.target)) closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("motion-ready");
  const revealObserver = !reducedMotion && "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 })
    : null;

  const observeReveals = (root = document) => {
    const regionOrders = new Map();
    queryAll(".reveal", root).forEach((element) => {
      const region = element.closest(".section, .site-footer") || root;
      const order = regionOrders.get(region) || 0;
      element.style.setProperty("--reveal-order", String(order % 8));
      element.style.setProperty("--reveal-delay", `${(order % 8) * 55}ms`);
      regionOrders.set(region, order + 1);
      if (region instanceof Element && region.classList.contains("section-active")) element.classList.add("visible");
      else if (revealObserver) revealObserver.observe(element);
      else element.classList.add("visible");
    });
  };
  observeReveals();

  const motionRegions = queryAll("main > section[id], .site-footer");
  if (!reducedMotion && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("section-active");
        queryAll(".reveal", entry.target).forEach((element) => {
          element.classList.add("visible");
          revealObserver?.unobserve(element);
        });
        sectionObserver.unobserve(entry.target);
      });
    }, { rootMargin: "-8% 0px -8%", threshold: 0.22 });
    motionRegions.forEach((region) => sectionObserver.observe(region));
  } else {
    motionRegions.forEach((region) => region.classList.add("section-active"));
  }

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "See GitHub";
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const trustedGithubUrl = (value, requiredPath) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "github.com" && url.pathname.startsWith(requiredPath);
    } catch {
      return false;
    }
  };

  const validateRelease = (release) => {
    if (!release || release.schemaVersion !== 1 || typeof release.assets !== "object") return null;
    const version = String(release.version || "").trim();
    if (!VERSION_PATTERN.test(version)) return null;

    const expectedNames = {
      installer: `LiveFlowStudio-Setup-${version}-x64.exe`,
      portable: `LiveFlowStudio-${version}-windows-x64.zip`,
    };
    const downloadPath = `${REPOSITORY_PATH}/releases/download/v${version}/`;
    const assets = {};

    for (const [kind, expectedName] of Object.entries(expectedNames)) {
      const asset = release.assets[kind];
      if (asset?.name !== expectedName || !trustedGithubUrl(asset.url, downloadPath)
        || !Number.isFinite(asset.size) || asset.size <= 0 || !CHECKSUM_PATTERN.test(asset.sha256 || "")) return null;
      assets[kind] = asset;
    }

    const checksumUrl = trustedGithubUrl(release.checksumUrl, downloadPath)
      && new URL(release.checksumUrl).pathname === `${downloadPath}SHA256SUMS.txt`
      ? release.checksumUrl
      : "";
    if (!checksumUrl) return null;

    const releaseUrl = trustedGithubUrl(release.releaseUrl, `${REPOSITORY_PATH}/releases/`)
      ? release.releaseUrl
      : LATEST_RELEASE_URL;

    return {
      version,
      assets,
      checksumUrl,
      releaseUrl,
      publishedAt: isNonEmptyText(release.publishedAt) ? release.publishedAt : "",
    };
  };

  const validateProductData = (data) => {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.capabilities) || !Array.isArray(data.faqCategories) || !Array.isArray(data.faqs)) return null;
    const categories = new Set(data.faqCategories.map((item) => item?.id));
    const validCapabilities = data.capabilities.every((item) =>
      isNonEmptyText(item?.id) && isNonEmptyText(item?.icon) && ICON_PATHS[item.icon] && isNonEmptyText(item?.accent)
      && isNonEmptyText(item?.label) && isNonEmptyText(item?.title) && isNonEmptyText(item?.summary)
      && Array.isArray(item?.proof) && item.proof.length > 0 && item.proof.every(isNonEmptyText));
    const validCategories = data.faqCategories.length > 0 && data.faqCategories.every((item) => isNonEmptyText(item?.id) && isNonEmptyText(item?.label));
    const validFaqs = data.faqs.length > 0 && data.faqs.every((item) => categories.has(item?.category) && isNonEmptyText(item?.question) && isNonEmptyText(item?.answer));
    return validCapabilities && validCategories && validFaqs ? data : null;
  };

  const createIcon = (name) => {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    const path = document.createElementNS(namespace, "path");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    path.setAttribute("d", ICON_PATHS[name]);
    svg.append(path);
    return svg;
  };

  const renderCapabilities = (product) => {
    const grid = document.querySelector("[data-capability-grid]");
    if (!grid) return;
    grid.replaceChildren();
    product.capabilities.forEach((item) => {
      const card = document.createElement("article");
      card.className = "feature-card capability-card reveal";

      const icon = document.createElement("span");
      icon.className = `feature-icon ${item.accent}`;
      icon.append(createIcon(item.icon));

      const label = document.createElement("span");
      label.className = `tag${item.accent === "yellow" ? " yellow-tag" : ""}`;
      label.textContent = item.label;

      const meta = document.createElement("div");
      meta.className = "capability-meta";
      meta.append(icon, label);

      const title = document.createElement("h3");
      title.textContent = item.title;
      const summary = document.createElement("p");
      summary.textContent = item.summary;
      const proof = document.createElement("ul");
      proof.className = "capability-proof";
      item.proof.forEach((text) => {
        const bullet = document.createElement("li");
        bullet.textContent = text;
        proof.append(bullet);
      });

      card.append(meta, title, summary, proof);
      grid.append(card);
    });
    grid.setAttribute("aria-busy", "false");
    observeReveals(grid);
  };

  const createFaqDetails = (faq, open) => {
    const details = document.createElement("details");
    details.className = "reveal";
    details.open = open;
    const summary = document.createElement("summary");
    summary.append(document.createTextNode(faq.question), createIcon("chevron"));
    const answer = document.createElement("p");
    answer.textContent = faq.answer;
    details.append(summary, answer);
    return details;
  };

  const renderFaq = (product) => {
    const tabs = document.querySelector("[data-faq-tabs]");
    const list = document.querySelector("[data-faq-list]");
    if (!tabs || !list) return;
    tabs.replaceChildren();
    tabs.setAttribute("role", "tablist");
    list.setAttribute("role", "tabpanel");
    list.id = "faq-panel";

    const selectCategory = (categoryId, focusTab = false) => {
      queryAll("[role='tab']", tabs).forEach((tab) => {
        const selected = tab.dataset.category === categoryId;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focusTab) tab.focus();
      });
      list.replaceChildren();
      const matchingFaqs = product.faqs.filter((faq) => faq.category === categoryId);
      matchingFaqs.forEach((faq, index) => list.append(createFaqDetails(faq, index === 0)));
      list.setAttribute("aria-busy", "false");
      observeReveals(list);
    };

    product.faqCategories.forEach((category, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "faq-tab";
      button.textContent = category.label;
      button.dataset.category = category.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "faq-panel");
      button.setAttribute("aria-selected", String(index === 0));
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener("click", () => selectCategory(category.id));
      tabs.append(button);
    });

    tabs.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const buttons = queryAll("[role='tab']", tabs);
      const currentIndex = buttons.indexOf(document.activeElement);
      if (currentIndex < 0) return;
      event.preventDefault();
      let nextIndex = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : currentIndex + (event.key === "ArrowRight" ? 1 : -1);
      nextIndex = (nextIndex + buttons.length) % buttons.length;
      selectCategory(buttons[nextIndex].dataset.category, true);
    });

    selectCategory(product.faqCategories[0].id);
  };

  const showProductError = () => {
    const message = "Product information could not be loaded. Open the repository documentation for verified details.";
    [document.querySelector("[data-capability-grid]"), document.querySelector("[data-faq-list]")].forEach((container) => {
      if (!container) return;
      const paragraph = document.createElement("p");
      paragraph.className = "data-placeholder data-error";
      paragraph.textContent = message;
      container.replaceChildren(paragraph);
      container.setAttribute("aria-busy", "false");
    });
  };

  const renderReleaseCopy = (release, product) => {
    const container = document.querySelector("[data-release-highlights]");
    const summary = document.querySelector("[data-release-summary]");
    const date = document.querySelector("[data-release-date]");
    if (!container) return;

    const copy = product?.releaseCopy?.[release.version];
    const hasMatchingCopy = copy && isNonEmptyText(copy.summary) && Array.isArray(copy.highlights)
      && copy.highlights.length > 0 && copy.highlights.every((item) => isNonEmptyText(item?.title) && isNonEmptyText(item?.description));

    if (summary) {
      summary.textContent = hasMatchingCopy
        ? copy.summary
        : `Version ${release.version} is available. Its official release notes have not yet been curated into English for this page.`;
    }
    if (date) {
      const parsedDate = new Date(release.publishedAt);
      date.textContent = Number.isNaN(parsedDate.getTime())
        ? `Verified release ${release.version}`
        : `Published ${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(parsedDate)}`;
    }

    container.replaceChildren();
    const highlights = hasMatchingCopy
      ? copy.highlights.slice(0, 4)
      : [{ title: "Official release notes", description: "Open the verified GitHub release for the complete change list and upgrade guidance." }];
    highlights.forEach((item, index) => {
      const article = document.createElement("article");
      article.className = "release-item reveal";
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const content = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = item.title;
      const description = document.createElement("p");
      description.textContent = item.description;
      content.append(title, description);
      article.append(number, content);
      container.append(article);
    });
    container.setAttribute("aria-busy", "false");
    observeReveals(container);
  };

  const applyRelease = (release) => {
    queryAll("[data-version]").forEach((element) => { element.textContent = release.version; });
    ["installer", "portable"].forEach((kind) => {
      const asset = release.assets[kind];
      queryAll(`[data-download="${kind}"]`).forEach((link) => {
        if (link instanceof HTMLAnchorElement) link.href = asset.url;
      });
      queryAll(`[data-size="${kind}"]`).forEach((element) => { element.textContent = formatBytes(Number(asset.size)); });
    });
    const releaseLink = document.querySelector("[data-release-link]");
    if (releaseLink instanceof HTMLAnchorElement) releaseLink.href = release.releaseUrl;
    const hashCommand = document.querySelector("[data-hash-command]");
    if (hashCommand) hashCommand.textContent = `Get-FileHash .\\${release.assets.installer.name} -Algorithm SHA256`;
    const link = document.querySelector("[data-checksum-link]");
    if (link instanceof HTMLAnchorElement) link.href = release.checksumUrl;
    ["installer", "portable"].forEach((kind) => {
      const value = document.querySelector(`[data-checksum="${kind}"]`);
      if (value) value.textContent = release.assets[kind].sha256.toLowerCase();
      document.querySelector(`[data-copy="${kind}"]`)?.removeAttribute("disabled");
    });
  };

  const setReleaseFallback = () => {
    ["installer", "portable"].forEach((kind) => {
      const value = document.querySelector(`[data-checksum="${kind}"]`);
      if (value) value.textContent = "Available on the official release page";
      document.querySelector(`[data-copy="${kind}"]`)?.setAttribute("disabled", "");
    });
    const link = document.querySelector("[data-checksum-link]");
    if (link instanceof HTMLAnchorElement) link.href = LATEST_RELEASE_URL;
  };

  const writeClipboard = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();
    if (!copied) throw new Error("Copy command failed");
  };

  queryAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const kind = button.getAttribute("data-copy");
      const checksum = document.querySelector(`[data-checksum="${kind}"]`)?.textContent?.trim() || "";
      if (!CHECKSUM_PATTERN.test(checksum)) return;
      button.setAttribute("disabled", "");
      try {
        await writeClipboard(checksum);
        if (copyStatus) copyStatus.textContent = `${kind === "installer" ? "Installer" : "Portable ZIP"} checksum copied.`;
        const label = button.querySelector("span");
        if (label) label.textContent = "Copied";
        window.setTimeout(() => { if (label) label.textContent = "Copy"; }, 1800);
      } catch {
        if (copyStatus) copyStatus.textContent = "Copy failed. Select the checksum manually.";
      } finally {
        button.removeAttribute("disabled");
      }
    });
  });

  const loadProduct = fetch(PRODUCT_DATA_URL, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Product data returned ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const product = validateProductData(data);
      if (!product) throw new Error("Product data failed validation");
      renderCapabilities(product);
      renderFaq(product);
      return product;
    })
    .catch(() => {
      showProductError();
      return null;
    });

  const loadRelease = fetch(RELEASE_DATA_URL, {
    cache: "no-cache",
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Release data returned ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const release = validateRelease(data);
      if (!release) throw new Error("Release assets failed validation");
      applyRelease(release);
      return release;
    })
    .catch(() => null);

  Promise.all([loadProduct, loadRelease]).then(([product, release]) => {
    if (!release) {
      setReleaseFallback();
      if (releaseStatus) releaseStatus.textContent = "Verified release data is temporarily unavailable. Open the official release page to download.";
      const releaseHighlights = document.querySelector("[data-release-highlights]");
      if (releaseHighlights) {
        const message = document.createElement("p");
        message.className = "data-placeholder data-error";
        message.textContent = "Release details are temporarily unavailable. Use the official release notes link.";
        releaseHighlights.replaceChildren(message);
        releaseHighlights.setAttribute("aria-busy", "false");
      }
      return;
    }

    renderReleaseCopy(release, product);
    if (releaseStatus) {
      releaseStatus.textContent = `Release ${release.version} files and checksums loaded from the verified release snapshot.`;
      releaseStatus.classList.add("verified");
    }
  });

  queryAll("[data-year]").forEach((element) => { element.textContent = String(new Date().getFullYear()); });
})();
