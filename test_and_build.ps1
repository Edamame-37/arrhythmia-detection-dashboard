# test_and_build.ps1
# Script untuk menjalankan pengujian unit & integrasi frontend, menganalisis hasilnya, lalu melakukan build produksi.

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "1. Menjalankan Pengujian Frontend (Vitest)..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Jalankan npm run test (vitest run) dan simpan outputnya
$testOutput = npm run test 2>&1

# Cetak output test ke konsol agar transparan
$testOutput | Out-String | Write-Host

# Analisis hasil test dari output string
$testOutputStr = $testOutput | Out-String

$totalPassed = 0
$totalFailed = 0

# Cari baris rangkuman pengujian (misal: "     Tests  14 passed (14)" atau "     Tests  1 failed | 13 passed (14)")
if ($testOutputStr -match 'Tests\s+([^\r\n]+)') {
    $testsSummary = $Matches[1]
    
    if ($testsSummary -match '(\d+)\s+failed') {
        $totalFailed = [int]$Matches[1]
    }
    
    if ($testsSummary -match '(\d+)\s+passed') {
        $totalPassed = [int]$Matches[1]
    }
}

# Laporkan hasil pengujian sebelum build
Write-Host "`n=============================================" -ForegroundColor Yellow
Write-Host "HASIL PENGUJIAN AKHIR:" -ForegroundColor Yellow
Write-Host "- Total Test Berhasil (Passed): $totalPassed" -ForegroundColor Green
$failedColor = "Gray"
if ($totalFailed -gt 0) { $failedColor = "Red" }
Write-Host "- Total Test Gagal (Failed): $totalFailed" -ForegroundColor $failedColor
Write-Host "=============================================" -ForegroundColor Yellow

if ($totalFailed -gt 0) {
    Write-Host "[ERROR] Ada pengujian yang gagal! Proses build & deploy dibatalkan." -ForegroundColor Red
    exit 1
}

# Periksa jika kompilasi test itu sendiri gagal (Passed dan Failed sama-sama 0, tapi ada error)
if ($totalPassed -eq 0 -and $totalFailed -eq 0) {
    if ($testOutputStr -match "error" -or $testOutputStr -match "FAIL") {
        Write-Host "[ERROR] Kompilasi pengujian atau eksekusi vitest gagal! Batalkan build." -ForegroundColor Red
        exit 1
    }
}

# Lanjutkan ke Build jika semua test berhasil
Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "2. Memulai Proses Build & Kompilasi Rilis..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Proses build rilis frontend gagal!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "PROSES BERHASIL!" -ForegroundColor Green
Write-Host "- Semua pengujian ($totalPassed test) lolos." -ForegroundColor Green
Write-Host "- Bundel produksi PWA telah dibuat di folder: dist\" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
