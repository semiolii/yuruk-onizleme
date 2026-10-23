// Yürük Orman Ürünleri
(() => {
  "use strict";
  const WHATSAPP = "905309645534";

  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-yil]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // ---------- Üst çubuk: hero üstünde yüzer, kaydırınca tam genişliğe yayılır ----------
  const ust = document.querySelector(".ust");
  const ustGuncelle = () => ust && ust.classList.toggle("is-scrolled", window.scrollY > 40);
  ustGuncelle();
  window.addEventListener("scroll", ustGuncelle, { passive: true });

  // ---------- Menü (mobil) ve Ürünler paneli ----------
  const menuBtn = document.querySelector(".menu-btn");
  const menu = document.querySelector(".menu");
  const megaBtn = document.querySelector("[data-mega]");
  const mega = megaBtn && document.getElementById(megaBtn.getAttribute("aria-controls"));
  const megaKapat = () => { if (mega && !mega.hidden) { mega.hidden = true; megaBtn.setAttribute("aria-expanded", "false"); } };
  const menuKapat = () => { if (menu) menu.classList.remove("acik"); if (menuBtn) menuBtn.setAttribute("aria-expanded", "false"); megaKapat(); };
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      const acik = menu.classList.toggle("acik");
      menuBtn.setAttribute("aria-expanded", String(acik));
      if (!acik) megaKapat();
    });
  }
  if (megaBtn && mega) {
    megaBtn.addEventListener("click", () => {
      mega.hidden = !mega.hidden;
      megaBtn.setAttribute("aria-expanded", String(!mega.hidden));
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".menu-oge") && !e.target.closest(".menu-btn")) megaKapat(); });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { megaKapat(); menuKapat(); } });
  if (menu) menu.addEventListener("click", (e) => { if (e.target.closest("a")) menuKapat(); });

  // ---------- Hero: slaytlar yumuşak geçişle değişir, sekmelerde ilerleme çubuğu ----------
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slaytlar = [...hero.querySelectorAll("[data-slayt]")];
    const sekmeler = [...hero.querySelectorAll("[data-sekme]")];
    const tasarruf = navigator.connection && navigator.connection.saveData;
    const otomatik = !azHareket;
    // Slayt süreleri: görsel 4,5 sn, video en fazla 5 sn (uzun videolar kesilip sıradakine geçilir)
    const GORSEL_SURE = 4500, VIDEO_EN_FAZLA = 5000;
    let aktif = 0, baslangic = 0, sure = GORSEL_SURE, gorunur = true, sayac = null;
    const videoOf = (i) => slaytlar[i].querySelector("video");
    const cubuk = (i, oran) => { const c = sekmeler[i].querySelector("i"); if (c) c.style.transform = `scaleX(${oran})`; };

    const git = (n) => {
      const eski = videoOf(aktif);
      if (eski) eski.pause();
      aktif = (n + slaytlar.length) % slaytlar.length;
      slaytlar.forEach((s, i) => { s.classList.toggle("is-active", i === aktif); if (i === aktif) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true"); });
      sekmeler.forEach((t, i) => {
        t.classList.toggle("is-active", i === aktif);
        t.classList.toggle("is-done", i < aktif);
        t.setAttribute("aria-selected", String(i === aktif));
        t.tabIndex = i === aktif ? 0 : -1;
        if (i !== aktif) cubuk(i, i < aktif ? 1 : 0);
      });
      cubuk(aktif, 0);
      const v = videoOf(aktif);
      sure = GORSEL_SURE;
      if (v && otomatik && !tasarruf) {
        v.currentTime = 0;
        v.play().catch(() => {});
        const vsure = () => Math.min(v.duration * 1000, VIDEO_EN_FAZLA);
        if (v.duration) sure = vsure();
        else v.addEventListener("loadedmetadata", () => (sure = vsure()), { once: true });
      }
      // Sıradaki video önceden yüklensin
      const sonraki = videoOf((aktif + 1) % slaytlar.length);
      if (sonraki && !tasarruf) sonraki.preload = "auto";
      baslangic = performance.now();
    };

    const tik = () => {
      if (!gorunur || document.hidden) { baslangic = performance.now() - parseFloat(sekmeler[aktif].dataset.gecen || 0); return; }
      const gecen = performance.now() - baslangic;
      sekmeler[aktif].dataset.gecen = gecen;
      cubuk(aktif, Math.min(gecen / sure, 1));
      if (gecen >= sure) { sekmeler[aktif].dataset.gecen = 0; git(aktif + 1); }
    };

    sekmeler.forEach((t, i) => t.addEventListener("click", () => { sekmeler[aktif].dataset.gecen = 0; git(i); }));
    hero.querySelector("[role=tablist]").addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      git(aktif + (e.key === "ArrowRight" ? 1 : -1));
      sekmeler[aktif].focus();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([g]) => {
        gorunur = g.isIntersecting;
        const v = videoOf(aktif);
        if (v && otomatik && !tasarruf) gorunur ? v.play().catch(() => {}) : v.pause();
      }).observe(hero);
    }
    git(0);
    if (otomatik) sayac = setInterval(tik, 100);
    else sekmeler.forEach((t, i) => cubuk(i, 0));
  }

  // ---------- Ürünler: sekmeler, istifle eşleşme, listeye ekleme ----------
  const istif = document.querySelector(".istif");
  const urunSekmeler = [...document.querySelectorAll("[data-urun]")];
  const urunSec = (k, odakla) => {
    urunSekmeler.forEach((t) => {
      const secili = t.dataset.urun === k;
      t.classList.toggle("is-active", secili);
      t.setAttribute("aria-selected", String(secili));
      t.tabIndex = secili ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !secili;
      if (secili && odakla) t.focus();
      if (secili) t.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    if (istif) {
      const levhaMi = istif.querySelector(`.levha[data-urun="${k}"]`);
      if (levhaMi) istif.dataset.secili = k; else delete istif.dataset.secili;
      istif.querySelectorAll(".levha, .etk").forEach((g) => g.classList.toggle("secili", g.dataset.urun === k));
    }
  };
  if (istif) {
    // Çizimdeki sıra alttan üste: sunta, MDF, suntalam, MDFlam
    const sira = ["sunta", "mdf", "suntalam", "mdflam"];
    istif.querySelectorAll(".levha").forEach((g, i) => (g.dataset.urun = sira[i]));
    istif.querySelectorAll(".etk").forEach((g, i) => (g.dataset.urun = sira[i]));
    istif.addEventListener("click", (e) => { const g = e.target.closest("[data-urun]"); if (g) urunSec(g.dataset.urun); });
  }
  urunSekmeler.forEach((t) => t.addEventListener("click", () => urunSec(t.dataset.urun)));
  const urunListe = document.querySelector(".urun-sekmeler");
  if (urunListe) urunListe.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = urunSekmeler.findIndex((t) => t.classList.contains("is-active"));
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + urunSekmeler.length) % urunSekmeler.length;
    urunSec(urunSekmeler[n].dataset.urun, true);
  });
  // Menüdeki ürün karoları: sekmeyi seç ve ürünlere in
  document.querySelectorAll("[data-urun-sec]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    urunSec(a.dataset.urunSec);
    menuKapat();
    document.getElementById("urunler").scrollIntoView({ behavior: azHareket ? "auto" : "smooth" });
  }));

  // Levhalar birleşik gelir, ekrana girerken ayrılır (sayfa sabitlenmez, kısa bir kaydırmada açılır)
  if (istif && !azHareket) {
    let bekliyor = false;
    const ayir = () => {
      bekliyor = false;
      const r = istif.getBoundingClientRect();
      const p = (window.innerHeight * 0.9 - r.top) / (window.innerHeight * 0.35);
      istif.style.setProperty("--p", Math.min(Math.max(p, 0), 1).toFixed(3));
    };
    const iste = () => { if (!bekliyor) { bekliyor = true; requestAnimationFrame(ayir); } };
    window.addEventListener("scroll", iste, { passive: true });
    window.addEventListener("resize", iste);
    ayir();
  }

  // ---------- Kaydırınca belirme + CNC plakasındaki parçalar ----------
  document.querySelectorAll("[data-sirali]").forEach((k) => [...k.children].forEach((c, i) => c.style.setProperty("--i", i)));
  const izlenen = document.querySelectorAll(".belir, .plaka");
  if (!("IntersectionObserver" in window)) {
    izlenen.forEach((el) => el.classList.add("gorundu"));
  } else {
    const io = new IntersectionObserver((gs) => gs.forEach((g) => {
      if (g.isIntersecting) { g.target.classList.add("gorundu"); io.unobserve(g.target); }
    }), { threshold: 0.2 });
    izlenen.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("gorundu");
      else io.observe(el);
    });
  }

  // ---------- Sipariş listesi → WhatsApp ----------
  const form = document.querySelector("[data-siparis]");
  if (!form) return;
  const satirlar = form.querySelector(".satirlar");
  const sablon = satirlar.querySelector(".satir").cloneNode(true);
  const hata = form.querySelector(".siparis-hata");
  const onizleme = form.querySelector("[data-onizleme]");
  const govde = form.querySelector("[data-govde]");

  const silDurumu = () => {
    const hepsi = satirlar.querySelectorAll(".satir");
    hepsi.forEach((s, i) => {
      const b = s.querySelector(".sil");
      b.disabled = hepsi.length === 1;
      b.setAttribute("aria-label", `${i + 1}. satırı sil`);
    });
  };
  form.querySelector("[data-ekle]").addEventListener("click", () => {
    const yeni = sablon.cloneNode(true);
    yeni.querySelectorAll("input").forEach((g) => (g.type === "checkbox" ? (g.checked = false) : (g.value = "")));
    yeni.querySelectorAll("select").forEach((g) => (g.selectedIndex = 0));
    satirlar.appendChild(yeni);
    silDurumu();
    yeni.querySelector("select").focus();
  });
  satirlar.addEventListener("click", (e) => {
    const b = e.target.closest(".sil");
    if (!b || b.disabled) return;
    b.closest(".satir").remove();
    silDurumu();
  });
  silDurumu();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hata.hidden = true;
    const kalemler = [...satirlar.querySelectorAll(".satir")].map((s) => ({
      urun: s.querySelector('[name="urun"]').value,
      kalinlik: s.querySelector('[name="kalinlik"]').value,
      adet: s.querySelector('[name="adet"]').value.trim(),
      cnc: s.querySelector('[name="cnc"]').checked,
      renk: s.querySelector('[name="renk"]').value.trim(),
    })).filter((k) => k.urun);
    const eksik = kalemler.find((k) => !k.adet);
    if (!kalemler.length || eksik) {
      hata.textContent = !kalemler.length ? "En az bir ürün seçin." : "Seçtiğiniz her ürün için adet yazın.";
      hata.hidden = false;
      return;
    }
    const firma = form.querySelector('[name="firma"]').value.trim();
    const ad = form.querySelector('[name="ad"]').value.trim();
    const satir = (k, i) => `${i + 1}) ${k.urun}${k.kalinlik ? " " + k.kalinlik : ""}${k.renk ? ", " + k.renk : ""} · ${k.adet} adet${k.cnc ? " · CNC kesim istiyorum" : ""}`;
    const kim = [firma && "Firma: " + firma, ad && "Ad: " + ad].filter(Boolean);
    const mesaj = ["Merhaba, stok ve fiyat bilgisi almak istiyorum.", "", ...kalemler.map(satir), ...(kim.length ? ["", ...kim] : [])].join("\n");
    // Mesaj önce gösterilir, gönderim gerçek bir linkle olur (script ile pencere açmak çoğu tarayıcıda engellenir)
    onizleme.querySelector("pre").textContent = mesaj;
    onizleme.querySelector("[data-wa]").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mesaj);
    govde.hidden = true;
    onizleme.hidden = false;
    onizleme.querySelector("[data-wa]").focus();
  });
  onizleme.querySelector("[data-duzenle]").addEventListener("click", () => {
    onizleme.hidden = true;
    govde.hidden = false;
  });

  // "Listeye ekle": ürünü ilk boş satıra yazar ve sipariş listesine iner
  document.querySelectorAll("[data-listeye]").forEach((b) => b.addEventListener("click", () => {
    let satir = [...satirlar.querySelectorAll(".satir")].find((s) => !s.querySelector('[name="urun"]').value);
    if (!satir) { form.querySelector("[data-ekle]").click(); satir = satirlar.lastElementChild; }
    satir.querySelector('[name="urun"]').value = b.dataset.listeye;
    onizleme.hidden = true; govde.hidden = false;
    document.getElementById("siparis").scrollIntoView({ behavior: azHareket ? "auto" : "smooth" });
    setTimeout(() => satir.querySelector('[name="kalinlik"]').focus({ preventScroll: true }), azHareket ? 0 : 500);
  }));
})();
