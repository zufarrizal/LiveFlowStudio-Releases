(() => {
  "use strict";

  const RELEASE_API = "https://api.github.com/repos/zufarrizal/LiveFlowStudio-Releases/releases/latest";
  const RELEASE_PATH = "/zufarrizal/LiveFlowStudio-Releases/releases/download/";
  const FALLBACK_VERSION = "1.2.0";
  const ASSET_PATTERNS = {
    installer: /^LiveFlowStudio-Setup-[0-9]+\.[0-9]+\.[0-9]+-x64\.exe$/i,
    portable: /^LiveFlowStudio-[0-9]+\.[0-9]+\.[0-9]+-windows-x64\.zip$/i,
  };

  const queryAll = (selector) => Array.from(document.querySelectorAll(selector));
  const menuButton = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-navigation]");
  const header = document.querySelector("[data-header]");

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
  const reveals = queryAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    reveals.forEach((element) => observer.observe(element));
  }

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "—";
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const trustedReleaseUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "github.com" && url.pathname.startsWith(RELEASE_PATH);
    } catch {
      return false;
    }
  };

  const applyRelease = (release) => {
    if (!release || typeof release !== "object" || !Array.isArray(release.assets)) return false;
    const version = String(release.tag_name || "").replace(/^v/i, "").trim();
    if (version !== FALLBACK_VERSION) return false;

    const matchedAssets = Object.entries(ASSET_PATTERNS).map(([kind, pattern]) => {
      const asset = release.assets.find((candidate) => pattern.test(String(candidate?.name || "")));
      return asset && trustedReleaseUrl(asset.browser_download_url) ? { kind, asset } : null;
    });
    if (matchedAssets.some((item) => item === null)) return false;

    matchedAssets.forEach((item) => {
      if (!item) return;
      const { kind, asset } = item;
      queryAll(`[data-download="${kind}"]`).forEach((link) => {
        if (link instanceof HTMLAnchorElement) link.href = asset.browser_download_url;
      });
      queryAll(`[data-size="${kind}"]`).forEach((element) => {
        element.textContent = formatBytes(Number(asset.size));
      });
    });

    queryAll("[data-version]").forEach((element) => { element.textContent = version; });
    const releaseLink = document.querySelector("[data-release-link]");
    if (releaseLink instanceof HTMLAnchorElement && typeof release.html_url === "string") {
      const url = new URL(release.html_url);
      if (url.protocol === "https:" && url.hostname === "github.com" && url.pathname.startsWith("/zufarrizal/LiveFlowStudio-Releases/releases/")) releaseLink.href = url.href;
    }
    return true;
  };

  const releaseStatus = document.querySelector("[data-release-status]");
  fetch(RELEASE_API, { headers: { Accept: "application/vnd.github+json" } })
    .then((response) => {
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      return response.json();
    })
    .then((release) => {
      if (!applyRelease(release)) throw new Error("Expected release assets were not found");
      if (releaseStatus) {
        releaseStatus.textContent = `Release ${FALLBACK_VERSION} asset details verified from GitHub.`;
        releaseStatus.classList.add("verified");
      }
    })
    .catch(() => {
      if (releaseStatus) releaseStatus.textContent = `GitHub is unavailable. Showing bundled release ${FALLBACK_VERSION} details.`;
    });

  const copyStatus = document.querySelector("[data-copy-status]");
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
      const checksum = document.querySelector(`[data-checksum="${kind}"]`)?.textContent?.trim();
      if (!checksum) return;
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

  queryAll("[data-year]").forEach((element) => { element.textContent = String(new Date().getFullYear()); });
})();
