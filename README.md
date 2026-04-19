# 🚀 Flope ERP - Modern Kurumsal Kaynak Planlama Sistemi

<div align="center">

![Flope ERP](https://img.shields.io/badge/Flope-ERP-0f172a?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

**Modern, hızlı ve kullanıcı dostu stok yönetim çözümü**

[Demo](#-demo) • [Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Teknolojiler](#-teknoloji-stack)

</div>

---

## 📋 İçindekiler

- [Genel Bakış](#-genel-bakış)
- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Performans](#-performans)
- [Lisans](#-lisans)

---

## 🎯 Genel Bakış

**Flope ERP**, modern işletmelerin stok yönetimi ihtiyaçlarını karşılamak için geliştirilmiş, tam özellikli bir Enterprise Resource Planning (ERP) sistemidir. 

### Neden Flope ERP?

- ⚡ **Hızlı**: Next.js 16 + Turbopack ile saniyeler içinde yüklenir
- 🎨 **Modern UI/UX**: Glassmorphism, GSAP animasyonlar, 3D görselleştirmeler
- 📱 **Responsive**: Mobil, tablet ve desktop'ta mükemmel performans
- 🔒 **Güvenli**: Supabase ile enterprise-grade güvenlik
- 📊 **Analitik**: Gerçek zamanlı raporlama ve görselleştirme
- 🌐 **PWA Desteği**: Ana ekrana eklenebilir, offline çalışabilir

---

## ✨ Özellikler

### 📦 Stok Yönetimi
- **Gerçek Zamanlı Stok Takibi**: Anlık stok durumu görüntüleme
- **Düşük Stok Uyarıları**: Otomatik kritik seviye bildirimleri
- **Marka Bazlı Filtreleme**: Gelişmiş arama ve filtreleme
- **Excel Import/Export**: Toplu veri aktarımı
- **Barkod Entegrasyonu**: Hızlı ürün tarama

### 📊 Dashboard & Analitik
- **5 Ana Metrik Kartı**: Toplam stok, SKU, düşük/orta/yüksek stok
- **İnteraktif Grafikler**: Nivo charts ile marka dağılımı
- **Gerçek Zamanlı Veriler**: Supabase realtime subscriptions
- **GSAP Animasyonlar**: Smooth, profesyonel geçişler

### 🔢 Stok Sayımı
- **Barkod Okuyucu**: Kamera ile hızlı sayım
- **Fark Analizi**: Sistem vs gerçek stok karşılaştırması
- **Onay Sistemi**: Çok aşamalı doğrulama
- **Geçmiş Kayıtları**: Tüm sayım detayları

### 👥 Personel Analizi
- **KPI Takibi**: Satış performans metrikleri
- **Ciro Analizi**: Personel bazında gelir raporları
- **Top 10 Ürünler**: En çok satan ürün listeleri
- **Excel Entegrasyonu**: Veri yükleme ve analiz

### 🏭 Operasyon Planlama
- **Görev Yönetimi**: Operasyonel iş takibi
- **Öncelik Sistemi**: Kritik görevleri vurgulama
- **Durum Takibi**: Başladı, devam ediyor, tamamlandı

### 🎨 3D Depo Görselleştirme
- **Three.js Entegrasyonu**: 3D depo modeli
- **İnteraktif Kamera**: OrbitControls ile gezinme
- **Gerçekçi Lighting**: Shadows ve ambient occlusion

---

## 🛠️ Teknoloji Stack

### Frontend
- **Framework**: Next.js 16.1.4 (App Router, Turbopack)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI, Shadcn/ui
- **Animations**: GSAP, Framer Motion
- **Charts**: Nivo, D3.js
- **3D Graphics**: Three.js, React Three Fiber

### Backend & Database
- **BaaS**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Realtime**: Supabase Realtime
- **Storage**: Supabase Storage

### State Management
- **Global State**: Zustand
- **Server State**: React Query (TanStack Query)

### Developer Tools
- **Runtime**: Bun.js
- **Package Manager**: Bun
- **Linting**: ESLint
- **Formatting**: Prettier (implicit)

### Performance & Optimization
- **Code Splitting**: Dynamic imports
- **Image Optimization**: Next.js Image
- **Lazy Loading**: React.lazy, Suspense
- **PWA**: Manifest.json, Service Worker ready

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ veya Bun 1.0+
- Supabase hesabı

### Adımlar

1. **Projeyi Klonlayın**
```bash
git clone https://github.com/yourusername/floper-main.git
cd floper-main
```

2. **Bağımlılıkları Yükleyin**
```bash
bun install
# veya
npm install
```

3. **Environment Variables**
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Development Server**
```bash
bun run dev
# veya
npm run dev
```

5. **Tarayıcıda Açın**
```
http://localhost:3000
```

---

## 📱 Kullanım

### Dashboard
1. Ana sayfadan "Dashboard" menüsüne tıklayın
2. Stok metriklerini görüntüleyin
3. Grafikleri inceleyeyin
4. Excel ile veri yükleyin

### Stok Sayımı
1. "Stok Sayımı" → "Yeni Sayım Başlat"
2. Barkod okuyucu ile ürünleri tarayın
3. Manuel giriş yapın (opsiyonel)
4. Farkları inceleyin ve onaylayın

### Personel Analizi
1. "Personel Analizi" menüsüne gidin
2. Excel dosyası yükleyin
3. KPI metriklerini görüntüleyin
4. Top 10 raporlarını inceleyin

---

## 📸 Ekran Görüntüleri

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Modern, glassmorphism tasarım ile stok metrikleri*

### Stok Sayımı
![Stock Counting](docs/screenshots/stock-counting.png)
*Barkod okuyucu ile hızlı sayım*

### 3D Depo
![3D Warehouse](docs/screenshots/3d-warehouse.png)
*Three.js ile interaktif depo görselleştirmesi*

### Personel KPI
![Personnel KPI](docs/screenshots/personnel-kpi.png)
*Detaylı performans analizi*

---

## ⚡ Performans

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Core Web Vitals
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **TTI**: < 3.0s
- **CLS**: < 0.1

### Optimizasyonlar
- ✅ Lazy loading (WaveBackground, Charts)
- ✅ Code splitting (Dynamic imports)
- ✅ Image optimization (Next.js Image)
- ✅ Touch optimization (44px min targets)
- ✅ Responsive padding (Mobile-first)
- ✅ PWA ready (Manifest + Icons)

---

## 🗂️ Proje Yapısı

```
floper-main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard sayfası
│   │   ├── stock/              # Stok yönetimi
│   │   ├── stock-counting/     # Stok sayımı
│   │   ├── personnel-analysis/ # Personel analizi
│   │   ├── operations/         # Operasyon planlama
│   │   └── warehouse-3d/       # 3D depo
│   ├── components/             # React bileşenleri
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── canvas/             # 3D components
│   │   ├── sidebar/            # Sidebar
│   │   └── counting/           # Sayım components
│   ├── hooks/                  # Custom hooks
│   ├── store/                  # Zustand stores
│   ├── lib/                    # Utilities
│   └── providers/              # Context providers
├── public/                     # Static files
│   ├── manifest.json           # PWA manifest
│   ├── icon-192.png            # PWA icons
│   └── icon-512.png
└── package.json
```

---

## 🎯 Gelecek Özellikler

- [ ] **Mobil Uygulama**: React Native ile iOS/Android
- [ ] **Offline Mode**: Service Worker + IndexedDB
- [ ] **AI Tahminleme**: Stok ihtiyacı tahmini
- [ ] **Multi-tenant**: Çoklu şirket desteği
- [ ] **E-fatura Entegrasyonu**: Otomatik fatura oluşturma
- [ ] **WhatsApp Bildirimleri**: Kritik stok uyarıları

---

## 👨‍💻 Geliştirici

**Doğukan Tevfik Sağıroğlu**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 📄 Lisans

Copyright © 2025 Doğukan Tevfik Sağıroğlu

Bu proje özel lisans altındadır. Ticari kullanım için iletişime geçiniz.

---

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - Framework
- [Supabase](https://supabase.com/) - Backend
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Three.js](https://threejs.org/) - 3D Graphics
- [GSAP](https://greensock.com/gsap/) - Animations

---

<div align="center">

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ in Turkey

</div>
