/**
 * test_and_build.js
 * Script untuk menjalankan pengujian unit & integrasi frontend, menganalisis hasilnya, lalu melakukan build produksi.
 * Berjalan secara native lintas platform (Windows, macOS, Linux).
 */

const { exec, execSync } = require('child_process');

console.log("\x1b[36m=============================================\x1b[0m");
console.log("\x1b[36m1. Menjalankan Pengujian Frontend (Vitest)...\x1b[0m");
console.log("\x1b[36m=============================================\x1b[0m");

// Jalankan npm run test (vitest run) dan tangkap hasilnya
const testProcess = exec('npm run test', (error, stdout, stderr) => {
    const output = stdout + stderr;
    console.log(output);

    let totalPassed = 0;
    let totalFailed = 0;

    // Cari baris rangkuman pengujian (misal: "     Tests  14 passed (14)" atau "     Tests  1 failed | 13 passed (14)")
    const testsLineMatch = output.match(/Tests\s+([^\r\n]+)/);
    if (testsLineMatch) {
        const testsSummary = testsLineMatch[1];
        
        const failedMatch = testsSummary.match(/(\d+)\s+failed/);
        if (failedMatch) {
            totalFailed = parseInt(failedMatch[1], 10);
        }
        
        const passedMatch = testsSummary.match(/(\d+)\s+passed/);
        if (passedMatch) {
            totalPassed = parseInt(passedMatch[1], 10);
        }
    }

    console.log("\n\x1b[33m=============================================\x1b[0m");
    console.log("\x1b[33mHASIL PENGUJIAN AKHIR:\x1b[0m");
    console.log(`\x1b[32m- Total Test Berhasil (Passed): ${totalPassed}\x1b[0m`);
    const failedColor = totalFailed > 0 ? "\x1b[31m" : "\x1b[90m";
    console.log(`${failedColor}- Total Test Gagal (Failed): ${totalFailed}\x1b[0m`);
    console.log("\x1b[33m=============================================\x1b[0m");

    if (totalFailed > 0) {
        console.error("\x1b[31m[ERROR] Ada pengujian yang gagal! Proses build & deploy dibatalkan.\x1b[0m");
        process.exit(1);
    }

    // Periksa jika kompilasi test itu sendiri gagal (Passed dan Failed sama-sama 0, tapi ada error)
    if (totalPassed === 0 && totalFailed === 0) {
        if (output.toLowerCase().includes("error") || output.includes("FAIL")) {
            console.error("\x1b[31m[ERROR] Kompilasi pengujian atau eksekusi vitest gagal! Batalkan build.\x1b[0m");
            process.exit(1);
        }
    }

    // Lanjutkan ke Build jika semua test berhasil
    console.log("\n\x1b[36m=============================================\x1b[0m");
    console.log("\x1b[36m2. Memulai Proses Build & Kompilasi Rilis...\x1b[0m");
    console.log("\x1b[36m=============================================\x1b[0m");

    try {
        execSync('npm run build', { stdio: 'inherit' });
        console.log("\n\x1b[32m=============================================\x1b[0m");
        console.log("\x1b[32mPROSES BERHASIL!\x1b[0m");
        console.log(`\x1b[32m- Semua pengujian (${totalPassed} test) lolos.\x1b[0m`);
        console.log("\x1b[32m- Bundel produksi PWA telah dibuat di folder: dist\\\x1b[0m");
        console.log("\x1b[32m=============================================\x1b[0m");
        process.exit(0);
    } catch (buildError) {
        console.error("\x1b[31m[ERROR] Proses build rilis frontend gagal!\x1b[0m");
        process.exit(1);
    }
});
