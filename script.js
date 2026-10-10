/* =========================================================
   VIEKA TRANS - script.js
   Daftar isi:
   1. Menu HP (buka/tutup)
   2. Efek header saat di-scroll + tombol kembali ke atas
   3. Menu aktif sesuai bagian yang sedang dilihat
   4. Form pencarian rute
   5. Slider rute populer
   6. Angka statistik berjalan
   7. Galeri pop-up (lightbox)
   8. Slider ulasan pelanggan
   9. Tahun otomatis di footer
   ========================================================= */

/* Tunggu sampai seluruh HTML selesai dimuat */
document.addEventListener("DOMContentLoaded", function () {

  /* ---------- 1. MENU HP ---------- */
  var tombolMenu = document.getElementById("menuToggle");
  var menu = document.getElementById("nav");

  tombolMenu.addEventListener("click", function () {
    var terbuka = menu.classList.toggle("open");
    tombolMenu.setAttribute("aria-expanded", terbuka);
  });

  // Tutup menu setelah salah satu link diklik
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("open");
      tombolMenu.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- 2. EFEK HEADER & TOMBOL KE ATAS ---------- */
  var header = document.getElementById("header");
  var keAtas = document.getElementById("toTop");

  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 10);
    keAtas.hidden = window.scrollY < 600;
  });

  keAtas.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 3. MENU AKTIF ---------- */
  var linkMenu = document.querySelectorAll(".nav > a");
  var bagian = [];
  linkMenu.forEach(function (link) {
    var target = document.querySelector(link.getAttribute("href"));
    if (target) bagian.push({ link: link, el: target });
  });

  window.addEventListener("scroll", function () {
    var posisi = window.scrollY + 140;
    var aktif = bagian[0];
    bagian.forEach(function (b) {
      if (b.el.offsetTop <= posisi) aktif = b;
    });
    linkMenu.forEach(function (l) { l.classList.remove("active"); });
    if (aktif) aktif.link.classList.add("active");
  });

  /* ---------- 4. FORM PENCARIAN RUTE ---------- */
  var form = document.getElementById("formCari");
  var asal = document.getElementById("asal");
  var tujuan = document.getElementById("tujuan");
  var tanggal = document.getElementById("tanggal");
  var penumpang = document.getElementById("penumpang");
  var hasil = document.getElementById("hasilCari");

  // Tanggal paling awal = hari ini
  var hariIni = new Date();
  var bulan = String(hariIni.getMonth() + 1).padStart(2, "0");
  var tgl = String(hariIni.getDate()).padStart(2, "0");
  tanggal.min = hariIni.getFullYear() + "-" + bulan + "-" + tgl;

  // Tombol tukar kota asal <-> tujuan
  document.getElementById("tukarKota").addEventListener("click", function () {
    var simpan = asal.value;
    asal.value = tujuan.value;
    tujuan.value = simpan;
  });

  function tampilkanPesan(teks, peringatan) {
    hasil.hidden = false;
    hasil.textContent = teks;
    hasil.classList.toggle("warn", !!peringatan);
  }

  function tandaiError(input, salah) {
    input.parentElement.classList.toggle("error", salah);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // cegah halaman reload

    tandaiError(asal, !asal.value);
    tandaiError(tujuan, !tujuan.value);
    tandaiError(tanggal, !tanggal.value);

    if (!asal.value || !tujuan.value || !tanggal.value) {
      tampilkanPesan("Lengkapi kota asal, kota tujuan, dan tanggal berangkat terlebih dahulu.", true);
      return;
    }
    if (asal.value === tujuan.value) {
      tandaiError(tujuan, true);
      tampilkanPesan("Kota asal dan kota tujuan tidak boleh sama.", true);
      return;
    }

    // REVISI NANTI: di sini tempat menghubungkan ke PHP + database.
    // Contoh: kirim data ke "cari-rute.php" memakai fetch(), lalu tampilkan jadwal dari database.
    var tanggalIndo = new Date(tanggal.value).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    tampilkanPesan(
      "Mencari bus " + asal.value + " - " + tujuan.value + " untuk " +
      penumpang.value + " penumpang pada " + tanggalIndo + "...",
      false
    );
  });

  /* ---------- 5. SLIDER RUTE POPULER ---------- */
  var trackRute = document.getElementById("ruteTrack");

  function geserRute(arah) {
    var kartu = trackRute.querySelector(".route-card");
    var lebar = kartu.offsetWidth + 20; // lebar kartu + jarak antar kartu
    trackRute.scrollBy({ left: arah * lebar, behavior: "smooth" });
  }
  document.getElementById("ruteSebelumnya").addEventListener("click", function () { geserRute(-1); });
  document.getElementById("ruteBerikutnya").addEventListener("click", function () { geserRute(1); });

  // Klik kartu rute = isi form pencarian otomatis
  trackRute.querySelectorAll(".route-card").forEach(function (kartu) {
    kartu.style.cursor = "pointer";
    kartu.addEventListener("click", function () {
      var nama = kartu.querySelector("h3").textContent.trim().split(/\s+/);
      asal.value = nama[0];
      tujuan.value = nama[nama.length - 1];
      document.getElementById("beranda").scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- 6. ANGKA STATISTIK BERJALAN ---------- */
  var angka = document.querySelectorAll("[data-count]");

  function hitung(el) {
    var target = parseInt(el.dataset.count, 10);
    var langkah = Math.max(1, Math.floor(target / 60));
    var sekarang = 0;
    var timer = setInterval(function () {
      sekarang += langkah;
      if (sekarang >= target) { sekarang = target; clearInterval(timer); }
      el.textContent = sekarang.toLocaleString("id-ID");
    }, 25);
  }

  if ("IntersectionObserver" in window) {
    var pengamat = new IntersectionObserver(function (daftar) {
      daftar.forEach(function (item) {
        if (item.isIntersecting) { hitung(item.target); pengamat.unobserve(item.target); }
      });
    }, { threshold: 0.6 });
    angka.forEach(function (a) { pengamat.observe(a); });
  } else {
    angka.forEach(function (a) { a.textContent = a.dataset.count; });
  }

  /* ---------- 7. GALERI POP-UP ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCap = document.getElementById("lightboxCaption");

  document.querySelectorAll(".gal").forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      var gambar = tombol.querySelector("img");
      if (gambar) {
        lightboxImg.style.backgroundImage = "url('" + gambar.getAttribute("src") + "')";
      } else {
        // foto belum ada: pakai warna cadangan
        lightboxImg.style.backgroundImage = getComputedStyle(tombol).backgroundImage;
      }
      lightboxCap.textContent = tombol.dataset.title;
      lightbox.hidden = false;
    });
  });

  function tutupLightbox() { lightbox.hidden = true; }
  document.getElementById("lightboxClose").addEventListener("click", tutupLightbox);
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) tutupLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") tutupLightbox(); });

  /* ---------- 8. SLIDER ULASAN ---------- */
  var trackUlasan = document.getElementById("reviewTrack");
  var kartuUlasan = trackUlasan.querySelectorAll(".review");
  var wadahDots = document.getElementById("reviewDots");
  var halamanAktif = 0;

  function jumlahHalaman() {
    var perLayar = window.innerWidth > 900 ? 2 : 1;
    return Math.ceil(kartuUlasan.length / perLayar);
  }

  function buatDots() {
    wadahDots.innerHTML = "";
    for (var i = 0; i < jumlahHalaman(); i++) {
      var dot = document.createElement("button");
      dot.className = "dot" + (i === halamanAktif ? " active" : "");
      dot.setAttribute("aria-label", "Ulasan halaman " + (i + 1));
      dot.dataset.index = i;
      dot.addEventListener("click", function () { keHalaman(parseInt(this.dataset.index, 10)); });
      wadahDots.appendChild(dot);
    }
  }

  function keHalaman(n) {
    var total = jumlahHalaman();
    halamanAktif = (n + total) % total; // kembali ke awal kalau sudah di ujung
    trackUlasan.scrollTo({ left: halamanAktif * trackUlasan.clientWidth, behavior: "smooth" });
    wadahDots.querySelectorAll(".dot").forEach(function (d, i) {
      d.classList.toggle("active", i === halamanAktif);
    });
  }

  document.getElementById("reviewPrev").addEventListener("click", function () { keHalaman(halamanAktif - 1); });
  document.getElementById("reviewNext").addEventListener("click", function () { keHalaman(halamanAktif + 1); });

  // Jalan otomatis tiap 6 detik
  setInterval(function () { keHalaman(halamanAktif + 1); }, 6000);

  window.addEventListener("resize", function () { halamanAktif = 0; buatDots(); });
  buatDots();

  /* ---------- 9. TAHUN OTOMATIS ---------- */
  document.getElementById("tahun").textContent = new Date().getFullYear();

});
