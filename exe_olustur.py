import subprocess, sys, os, shutil

print("1/3: Gerekli paketler (pyinstaller, yt-dlp, imageio-ffmpeg) kontrol ediliyor...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-U", "pyinstaller", "yt-dlp", "imageio-ffmpeg"])

print("\n2/3: studyo_motor.exe derleniyor (Bu islem 1-2 dakika surebilir, lutfen bekleyin)...")
subprocess.check_call([
    sys.executable, "-m", "PyInstaller",
    "--noconfirm",
    "--onefile",
    "--console",
    "--name", "studyo_motor",
    "--collect-all", "imageio_ffmpeg",
    "--hidden-import", "yt_dlp",
    "studyo_motor.py"
])

print("\n3/3: studyo_motor.exe ana klasore tasiniyor ve gecici dosyalar temizleniyor...")
dist_exe = os.path.join("dist", "studyo_motor.exe")
if os.path.exists(dist_exe):
    shutil.move(dist_exe, "studyo_motor.exe")

for folder in ["build", "dist"]:
    if os.path.exists(folder):
        shutil.rmtree(folder, ignore_errors=True)
if os.path.exists("studyo_motor.spec"):
    os.remove("studyo_motor.spec")

print("\n=====================================================")
print("🎉 ISLEM TAMAMLANDI! 'studyo_motor.exe' hazir!")
print("Artik Python kurulu olmayan bilgisayarlarda bile")
print("sadece studyo_motor.exe + HTML dosyasini kullanabilirsin!")
print("=====================================================")
input("Kapatmak icin Enter tusuna basin...")