# LiveFlow Studio

![Stable](https://img.shields.io/badge/Stable-1.4.0-22C55E)
![Windows](https://img.shields.io/badge/Windows-10%20%7C%2011-1674CE?logo=windows11&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-x64-38C8ED)

Kanal resmi installer dan pembaruan LiveFlow Studio untuk Windows.

LiveFlow Studio menghubungkan aktivitas TikTok LIVE dan Saweria dengan Action interaktif seperti Minecraft command, keystroke, audio lokal, Goal, serta overlay untuk OBS dan TikTok LIVE Studio.

Versi stable Latest 1.4.0 menambahkan pergantian TikTok username mandiri dengan binding satu identitas instalasi + satu IP publik, bridge lokal Host Coins Counter, kontrol Hide boxes/Hide text pada Event List Box, serta placeholder Minecraft yang konsisten untuk TikTok, Saweria, dan MediaShare. Paket belum memiliki Authenticode komersial sehingga Windows dapat menampilkan peringatan publisher.

Export konfigurasi tetap berupa satu file JSON untuk preset aktif tanpa menyertakan file audio, identitas akun, credential, identitas internal preset, data realtime, atau progress sesi. Ketika import, konfigurasi diterapkan ke preset tujuan yang aktif, referensi Action di-remap, audio MyInstants yang belum tersedia diunduh otomatis setelah preflight disetujui, dan aplikasi membuat backup sebelum konfigurasi diganti.

## Fitur utama

- Watcher TikTok LIVE otomatis dengan Action untuk gift, follow, share, subscribe, dan komentar.
- Satu email memiliki satu TikTok username aktif yang dapat diganti dari aplikasi; login dibatasi ke satu identitas instalasi dan satu IP publik sampai Admin mereset binding.
- Integrasi Saweria, Minecraft, keystroke, audio lokal, media overlay, Goal, dan widget realtime.
- Bridge Host Coins Counter lokal membagikan lifecycle room dan gift coin final tanpa membuat watcher TikTok kedua.
- Event List Box dapat menyembunyikan box visual/caption atau caption teks per preset pada preview dan PNG.
- Shop read-only untuk melihat produk Zal Digital; transaksi dan dukungan pelanggan tetap ditangani bot Telegram resmi.
- Pengaturan durasi, status Action, dan efek aktif langsung dari tabel Actions.
- Export/import konfigurasi JSON lintas akun dengan validasi, rollback, dan pemulihan audio MyInstants.
- Gift catalog dapat diperbarui dari header dan otomatis diperbarui setelah import berhasil.
- Test Action dan simulasi Specific Gift menggunakan delay lima detik dengan feedback countdown.
- Test Action dapat menjalankan batch 1-100 kali. Gift Simulator mengirim satu combo 1-100 gift dengan jarak input acak 0,2-1,0 detik; pacing tambahan 0,5 detik dapat diatur secara global per preset.
- Audio lokal diputar oleh player Windows backend dan Live Execution Log melakukan resync setelah jendela dipulihkan.
- Editor Keystroke menyediakan notice dan tautan unduh AutoIt resmi.
- Goal Overlay dan pengaturannya tersimpan secara independen untuk setiap preset.
- Pesan autentikasi dan diagnostik disanitasi agar URL internal, token, dan credential tidak tampil di UI.
- Manifest Ed25519 dan high-water anti-rollback melindungi updater pada versi 1.3.0 dan sesudahnya.

## Unduh

Buka [stable Latest](https://github.com/zufarrizal/LiveFlowStudio-Releases/releases/latest) atau [halaman versi 1.4.0](https://github.com/zufarrizal/LiveFlowStudio-Releases/releases/tag/v1.4.0), lalu pilih salah satu:

- `LiveFlowStudio-Setup-<version>-x64.exe` untuk instalasi normal.
- `LiveFlowStudio-<version>-windows-x64.zip` untuk versi portable.

Paket release juga memuat:

- `SHA256SUMS.txt` untuk memeriksa integritas file.
- `release-manifest.json` yang mengikat metadata dan checksum installer/portable.
- `release-manifest-signatures.json` untuk memverifikasi manifest menggunakan Ed25519.

Installer dan portable ZIP 1.4.0 menyertakan dokumen versi berikut:

- `EULA.txt` — perjanjian lisensi pengguna akhir.
- `PRIVACY.txt` — pemberitahuan pemrosesan dan penyimpanan data.
- `QUICK_START.txt` — panduan instalasi, setup, Shop, serta export/import.
- `THIRD_PARTY_NOTICES.txt` — daftar komponen, runtime, dan lisensi pihak ketiga.

## Instalasi

1. Unduh installer dari halaman release resmi.
2. Cocokkan SHA-256 file dengan `SHA256SUMS.txt`.
3. Jalankan installer dan buka LiveFlow Studio.
4. Login menggunakan akun yang sudah dibuat dan diaktifkan oleh Admin.

Contoh verifikasi melalui PowerShell:

```powershell
Get-FileHash .\LiveFlowStudio-Setup-1.4.0-x64.exe -Algorithm SHA256
```

## Pembaruan otomatis

LiveFlow Studio 1.3.0 dan sesudahnya hanya menerima aset stable Latest dari repository ini, memverifikasi signature Ed25519 manifest beserta checksum installer, lalu meminta persetujuan pengguna sebelum menjalankannya. Karena 1.4.0 adalah stable Latest, versi ini ditawarkan oleh pemeriksaan update otomatis.

> **Upgrade pertama dari 1.2.1:** walaupun 1.3.0 tersedia sebagai Latest, verifier Ed25519 belum tersedia pada aplikasi lama dan paket belum memiliki Authenticode komersial. Unduh 1.3.0 secara manual dari halaman release resmi, cocokkan SHA-256 melalui kanal owner, tutup 1.2.1, lalu jalankan installer baru. Jangan mengandalkan tombol update otomatis 1.2.1 untuk mengautentikasi transisi bootstrap ini.

## Persyaratan

- Windows 10 atau Windows 11 64-bit.
- Microsoft Edge WebView2 Runtime.
- Koneksi internet untuk login, TikTok LIVE, gift catalog, Shop, Saweria, Sound Library, dan cloud overlay.
- Akun LiveFlow Studio yang masih aktif.
- AutoIt yang sudah dipasang jika menggunakan Keystroke Action: [unduh dari situs resmi](https://www.autoitscript.com/site/autoit/downloads/).

## Keamanan distribusi

- Repository ini hanya berisi binary release; source code proprietary tetap privat.
- Jangan mengunduh installer dari mirror, pesan pribadi, atau domain yang tidak tercantum di sini.
- Installer saat ini belum ditandatangani dengan sertifikat code-signing komersial. Windows dapat menampilkan `Unknown Publisher`; selalu periksa sumber file dan SHA-256 sebelum memasang.
- `release-manifest.json` harus memiliki pasangan `release-manifest-signatures.json` yang valid. LiveFlow Studio 1.3.0 dan sesudahnya menolak release tanpa signature produksi yang dikenal.
- Aplikasi Admin, Supabase secret, database password, dan credential deployment tidak pernah menjadi bagian dari paket pengguna.

## Bantuan

Untuk bantuan produk dan transaksi Shop, hubungi [bot Telegram Zal Digital](https://t.me/ZalDigitalBot). Informasi pengembang tersedia melalui [GitHub Zufar Rizal](https://github.com/zufarrizal). Dukungan sukarela untuk pengembangan dapat diberikan melalui [Saweria](https://saweria.co/ZufarRizal).

Copyright © 2026 Zufar Rizal. All rights reserved.
