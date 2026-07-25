# LiveFlow Studio

![Latest release](https://img.shields.io/github/v/release/zufarrizal/LiveFlowStudio-Releases?display_name=tag&label=latest)
![Windows](https://img.shields.io/badge/Windows-10%20%7C%2011-1674CE?logo=windows11&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-x64-38C8ED)

Kanal resmi installer dan pembaruan LiveFlow Studio untuk Windows.

LiveFlow Studio menghubungkan aktivitas TikTok LIVE dan Saweria dengan Action interaktif seperti Minecraft command, keystroke, audio lokal, Goal, serta overlay untuk OBS dan TikTok LIVE Studio.

Versi 1.1.6 merapikan modal Action dan Event: label kondisi tidak lagi tertutup, kontrol media sejajar dengan tombolnya, dan pemilih keystroke berada dalam satu baris yang konsisten.

Backup konfigurasi tetap mencakup Setup, preset aktif, Action, Event, Timer, Screen, Goal, Overlay Gallery, dan Event List Box tanpa membawa identitas akun, credential, data realtime, atau progress sesi.

## Unduh

Buka [release terbaru](https://github.com/zufarrizal/LiveFlowStudio-Releases/releases/latest), lalu pilih salah satu:

- `LiveFlowStudio-Setup-<version>-x64.exe` untuk instalasi normal.
- `LiveFlowStudio-<version>-windows-x64.zip` untuk versi portable.

Paket release juga memuat:

- `SHA256SUMS.txt` untuk memeriksa integritas file.
- `release-manifest.json` yang digunakan pemeriksa update aplikasi.

## Instalasi

1. Unduh installer dari halaman release resmi.
2. Cocokkan SHA-256 file dengan `SHA256SUMS.txt`.
3. Jalankan installer dan buka LiveFlow Studio.
4. Login menggunakan akun yang sudah dibuat dan diaktifkan oleh Admin.

Contoh verifikasi melalui PowerShell:

```powershell
Get-FileHash .\LiveFlowStudio-Setup-1.1.6-x64.exe -Algorithm SHA256
```

## Pembaruan otomatis

Setelah login, LiveFlow Studio memeriksa release stabil terbaru. Aplikasi hanya menerima aset dari repository ini, memverifikasi checksum installer, lalu meminta persetujuan pengguna sebelum menjalankannya.

## Persyaratan

- Windows 10 atau Windows 11 64-bit.
- Microsoft Edge WebView2 Runtime.
- Koneksi internet untuk login, TikTok LIVE, Saweria, Sound Library, dan cloud overlay.
- Akun LiveFlow Studio yang masih aktif.

## Keamanan distribusi

- Repository ini hanya berisi binary release; source code proprietary tetap privat.
- Jangan mengunduh installer dari mirror, pesan pribadi, atau domain yang tidak tercantum di sini.
- Installer saat ini belum ditandatangani dengan sertifikat code-signing komersial. Windows dapat menampilkan `Unknown Publisher`; selalu periksa sumber file dan SHA-256 sebelum memasang.
- Aplikasi Admin, Supabase secret, database password, dan credential deployment tidak pernah menjadi bagian dari paket pengguna.

## Bantuan

Informasi pengembang dan kontak resmi tersedia melalui [GitHub Zufar Rizal](https://github.com/zufarrizal). Dukungan sukarela untuk pengembangan dapat diberikan melalui [Saweria](https://saweria.co/ZufarRizal).

Copyright © 2026 Zufar Rizal. All rights reserved.
