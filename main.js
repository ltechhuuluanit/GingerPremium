const THEME_KEY = "gp-theme";

const getInitialTheme = () => {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

applyTheme(getInitialTheme());

const loadComponent = async (selector, filePath) => {
  const target = document.querySelector(selector);
  if (!target) return null;

  const baseUrl = new URL(".", window.location.href);
  const componentUrl = new URL(filePath, baseUrl).toString();

  try {
    const response = await fetch(componentUrl + "?v=" + Date.now(), {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("HTTP " + response.status);

    const html = await response.text();

    // Xóa script Live Server inject vào HTML fragment
    const clean = html.replace(/<script[\s\S]*?<\/script>/gi, "");

    target.innerHTML = clean;
    return target;
  } catch (error) {
    console.warn("Không thể tải " + filePath, error);
    return null;
  }
};

const initNav = () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) {
    return;
  }

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  menu.addEventListener("click", (event) => {
    if (event.target && event.target.matches("a")) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) {
      closeMenu();
    }
  });

  // Tự động kích hoạt class active cho trang hiện tại
  const currentPath = window.location.pathname;
  let pageName = currentPath.split("/").pop() || "index.html";
  if (pageName === "") pageName = "index.html";

  const navLinks = menu.querySelectorAll("a:not(.btn)");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === pageName) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

const initThemeToggle = () => {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) {
    return;
  }

  const syncState = () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    toggle.setAttribute("aria-pressed", String(current === "light"));
  };

  syncState();

  toggle.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = current === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    syncState();
  });
};

const initHeroSlider = () => {
  const slider = document.querySelector(".hero-slider");
  if (!slider || typeof Swiper === "undefined") {
    return;
  }

  new Swiper(slider, {
    loop: true,
    speed: 800,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".hero-pagination",
      clickable: true,
    },
  });
};

const initCountdown = () => {
  const timer = document.querySelector("[data-countdown]");
  if (!timer) {
    return;
  }

  const duration = Number(timer.dataset.duration) || 8130;
  const storageKey = "gp-flash-sale-end";
  const now = Date.now();
  let endTime = Number(localStorage.getItem(storageKey));

  if (!endTime || endTime <= now) {
    endTime = now + duration * 1000;
    localStorage.setItem(storageKey, String(endTime));
  }

  const update = () => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      endTime = Date.now() + duration * 1000;
      localStorage.setItem(storageKey, String(endTime));
    }
    const totalSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    timer.textContent = `${hours}:${minutes}:${seconds}`;
  };

  update();
  window.setInterval(update, 1000);
};

const initStickyCta = () => {
  const stickyCta = document.querySelector(".sticky-cta");
  if (stickyCta) {
    document.body.classList.add("has-sticky-cta");
  }
};

const initScrollReveal = () => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("active"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("active"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, current) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          current.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  items.forEach((item) => observer.observe(item));
};

const initScrollHeader = () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
};

const initAttractionPopup = () => {
  if (sessionStorage.getItem("gp-popup-shown") === "true") {
    return;
  }

  setTimeout(() => {
    // Tạo phần tử popup
    const popupOverlay = document.createElement("div");
    popupOverlay.className = "attraction-popup-overlay";
    popupOverlay.id = "attractionPopup";
    popupOverlay.innerHTML = `
      <div class="attraction-popup-container">
        <button class="attraction-popup-close" id="closePopup" aria-label="Đóng popup">&times;</button>
        <div class="attraction-popup-gift-icon">🎁</div>
        <h3 class="attraction-popup-title">Món Quà Sức Khỏe Độc Quyền</h3>
        <p class="attraction-popup-subtitle">Nhận ngay Cẩm nang Detox 7 ngày & Ưu đãi giảm 15% cho đơn hàng đầu tiên của bạn.</p>
        <form class="attraction-popup-form" id="popupForm">
          <input type="text" id="popupName" class="attraction-popup-input" placeholder="Họ và tên của bạn" required>
          <input type="tel" id="popupPhone" class="attraction-popup-input" placeholder="Số điện thoại nhận ưu đãi" required>
          <button type="submit" class="attraction-popup-btn">Nhận Quà Ngay</button>
        </form>
        <p class="attraction-popup-note">Thông tin của bạn được bảo mật tuyệt đối.</p>
      </div>
    `;

    document.body.appendChild(popupOverlay);

    // Kích hoạt animation hiện ra
    requestAnimationFrame(() => {
      popupOverlay.classList.add("is-active");
    });

    const closePopupBtn = popupOverlay.querySelector("#closePopup");
    const popupForm = popupOverlay.querySelector("#popupForm");

    const closePopup = () => {
      popupOverlay.classList.remove("is-active");
      sessionStorage.setItem("gp-popup-shown", "true");
      setTimeout(() => {
        popupOverlay.remove();
      }, 500);
    };

    // Đóng khi bấm nút close hoặc click ra ngoài container
    closePopupBtn.addEventListener("click", closePopup);
    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) {
        closePopup();
      }
    });

    // Đăng ký nhận thông tin
    popupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = popupOverlay.querySelector("#popupName").value;
      const phone = popupOverlay.querySelector("#popupPhone").value;

      // Hiển thị thông báo đăng ký thành công sang trọng
      const container = popupOverlay.querySelector(".attraction-popup-container");
      container.innerHTML = `
        <button class="attraction-popup-close" id="closePopup" aria-label="Đóng">&times;</button>
        <div class="attraction-popup-gift-icon" style="animation: none;">🎉</div>
        <h3 class="attraction-popup-title" style="color: var(--accent);">Đăng Ký Thành Công!</h3>
        <p class="attraction-popup-subtitle">Chào mừng <strong>${name}</strong> đồng hành cùng Ginger Premium.<br>Ưu đãi 15% và Cẩm nang Detox đang được gửi đến SĐT <strong>${phone}</strong>.</p>
        <div style="margin-top: 20px;">
          <button class="btn btn-primary" id="btnContinue" style="padding: 10px 24px; font-family: 'Times New Roman', Times, serif;">Bắt đầu khám phá</button>
        </div>
      `;

      container.querySelector("#closePopup").addEventListener("click", closePopup);
      container.querySelector("#btnContinue").addEventListener("click", closePopup);

      sessionStorage.setItem("gp-popup-shown", "true");
    });
  }, 3000);
};

const initAnalyticsAndStats = () => {
  // Khởi tạo các giá trị cơ sở nếu chưa tồn tại
  if (!localStorage.getItem("gp-base-visits")) {
    localStorage.setItem("gp-base-visits", Math.floor(15284 + Math.random() * 200).toString());
  }
  if (!localStorage.getItem("gp-real-visits")) {
    localStorage.setItem("gp-real-visits", "0");
  }
  if (!localStorage.getItem("gp-base-views")) {
    localStorage.setItem("gp-base-views", Math.floor(8432 + Math.random() * 100).toString());
  }
  if (!localStorage.getItem("gp-real-views")) {
    localStorage.setItem("gp-real-views", "0");
  }
  if (!localStorage.getItem("gp-base-clicks")) {
    localStorage.setItem("gp-base-clicks", Math.floor(24915 + Math.random() * 300).toString());
  }
  if (!localStorage.getItem("gp-real-clicks")) {
    localStorage.setItem("gp-real-clicks", "0");
  }

  // Tăng lượt truy cập
  let realVisits = parseInt(localStorage.getItem("gp-real-visits") || "0", 10);
  realVisits += 1;
  localStorage.setItem("gp-real-visits", realVisits.toString());

  // Tăng lượt xem sản phẩm nếu đang ở trang sản phẩm
  const isProductPage = window.location.pathname.includes("san-pham.html");
  let realViews = parseInt(localStorage.getItem("gp-real-views") || "0", 10);
  if (isProductPage) {
    realViews += 1;
    localStorage.setItem("gp-real-views", realViews.toString());
    
    // Gửi sự kiện GA về lượt xem sản phẩm
    if (typeof gtag === "function") {
      gtag("event", "view_item", {
        event_category: "Product",
        event_label: "Xem sản phẩm Ginger Premium",
        value: 1
      });
    }
  }

  // Cập nhật giao diện
  const updateStatsDisplay = () => {
    const visitsCountEl = document.getElementById("visits-count");
    const viewsCountEl = document.getElementById("views-count");
    const clicksCountEl = document.getElementById("clicks-count");

    const baseVisits = parseInt(localStorage.getItem("gp-base-visits") || "15284", 10);
    const baseViews = parseInt(localStorage.getItem("gp-base-views") || "8432", 10);
    const baseClicks = parseInt(localStorage.getItem("gp-base-clicks") || "24915", 10);
    const realClicks = parseInt(localStorage.getItem("gp-real-clicks") || "0", 10);

    if (visitsCountEl) {
      visitsCountEl.innerText = (baseVisits + realVisits).toLocaleString("vi-VN");
    }
    if (viewsCountEl) {
      viewsCountEl.innerText = (baseViews + realViews).toLocaleString("vi-VN");
    }
    if (clicksCountEl) {
      clicksCountEl.innerText = (baseClicks + realClicks).toLocaleString("vi-VN");
    }
  };

  // Cập nhật lần đầu
  updateStatsDisplay();

  // Lắng nghe hành vi click trên toàn trang
  document.addEventListener("click", (e) => {
    let realClicks = parseInt(localStorage.getItem("gp-real-clicks") || "0", 10);
    realClicks += 1;
    localStorage.setItem("gp-real-clicks", realClicks.toString());
    updateStatsDisplay();

    // Gửi sự kiện click về Google Analytics
    if (typeof gtag === "function") {
      const clickedEl = e.target;
      const targetText = clickedEl.innerText ? clickedEl.innerText.trim().substring(0, 30) : "";
      const targetId = clickedEl.id || "";
      const targetClass = clickedEl.className || "";
      
      gtag("event", "click_interaction", {
        event_category: "Engagement",
        event_label: `Click: ${targetText || targetId || targetClass || "Element"}`,
        value: 1
      });
    }
  });
};

const renderDynamicContent = (data) => {
  if (!data) return;

  // 1. Render Products on products page (san-pham.html)
  const productsContainer = document.getElementById("products-container");
  if (productsContainer && data.products) {
    productsContainer.innerHTML = "";
    data.products.forEach(prod => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <img class="img-card" src="${prod.image || 'assets/img/products/product-1.jpg'}" alt="${prod.name}" />
        <h3>${prod.name}</h3>
        <p>${prod.description}</p>
        <div class="price-row">
          <span>${prod.price}</span>
          <a class="btn btn-primary btn-small" href="lien-he.html">Đặt hàng</a>
        </div>
      `;
      productsContainer.appendChild(card);
    });
  }

  // 2. Render Best Sellers on home page (index.html)
  const bestSellersContainer = document.getElementById("best-sellers-container");
  if (bestSellersContainer && data.products) {
    bestSellersContainer.innerHTML = "";
    // Show first 3 products
    data.products.slice(0, 3).forEach(prod => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <img class="img-card" src="${prod.image || 'assets/img/products/product-1.jpg'}" alt="${prod.name}" />
        <h3>${prod.name}</h3>
        <p>${prod.description}</p>
        <div class="price-row">
          <span>${prod.price}</span>
          <a class="btn btn-primary btn-small" href="san-pham.html">Mua ngay</a>
        </div>
      `;
      bestSellersContainer.appendChild(card);
    });
  }

  // 3. Render Blog Posts on blog page (blog.html)
  const blogContainer = document.getElementById("blog-posts-container");
  if (blogContainer && data.blogs) {
    blogContainer.innerHTML = "";
    data.blogs.forEach(post => {
      const card = document.createElement("article");
      card.className = "post-card";
      card.innerHTML = `
        <span class="post-tag">${post.tag}</span>
        <h3>${post.title}</h3>
        <p>${post.description}</p>
        <a class="text-link" href="#">Đọc tiếp</a>
      `;
      blogContainer.appendChild(card);
    });
  }

  // 4. Render News PR Posts on news page (tin-tuc.html)
  const newsContainer = document.getElementById("news-posts-container");
  if (newsContainer && data.news) {
    newsContainer.innerHTML = "";
    data.news.forEach(n => {
      const card = document.createElement("article");
      card.className = "post-card";
      card.innerHTML = `
        <span class="post-tag">${n.tag}</span>
        <h3>${n.title}</h3>
        <p>${n.description}</p>
        <a class="text-link" href="#">Xem bài</a>
      `;
      newsContainer.appendChild(card);
    });
  }

  // 5. Render Jobs on jobs page (tuyen-dung.html)
  const jobsContainer = document.getElementById("jobs-container");
  if (jobsContainer && data.jobs) {
    jobsContainer.innerHTML = "";
    data.jobs.forEach(job => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>${job.title}</h3>
        <p>${job.description}</p>
        <p class="section-subtitle">${job.type} | ${job.location}</p>
      `;
      jobsContainer.appendChild(card);
    });
  }
};

const fetchAndLoadDynamicContent = async () => {
  const JSONBIN_KEY = "$2a$10$Evr7NfnqJIFnwRNOsbjqW.0xTLmqmdDeO7P40YkcVg8c95K1ehgvC";
  const JSONBIN_BIN = "6a1e90ebf5f4af5e29abf94a";
  let siteData = null;

  // 1) Try JSONBin (online – dữ liệu thật từ admin)
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN}`, {
      method: "GET",
      headers: { "X-Master-Key": JSONBIN_KEY }
    });
    if (res.ok) {
      const json = await res.json();
      siteData = json.record || json;
    }
  } catch (e) {
    console.warn("JSONBin fetch failed, trying local file...", e);
  }

  // 2) Fallback: local file
  if (!siteData) {
    try {
      const res = await fetch("assets/data/site_data.json");
      if (res.ok) {
        siteData = await res.json();
      }
    } catch (e) {
      console.error("Could not fetch local dynamic configuration:", e);
    }
  }

  if (siteData) {
    renderDynamicContent(siteData);
  }
};

const init = async () => {
  // Lấy trạng thái từ localStorage ra khi khởi tạo trang (DOMContentLoaded)
  applyTheme(getInitialTheme());

  initNav();
  initScrollHeader();
  initThemeToggle();
  initHeroSlider();
  initCountdown();
  initStickyCta();
  initScrollReveal();
  initAttractionPopup();
  initAnalyticsAndStats();
  await fetchAndLoadDynamicContent();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
