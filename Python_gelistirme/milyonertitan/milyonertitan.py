import tkinter as tk  
from tkinter import messagebox, simpledialog
import winsound
import random
import math
import os
import json
import sys

class MilyonerTitan:
    def __init__(self, root):
        self.root = root
        self.root.title("MİLYONER TİTAN FULL HD - SHOW EDITION")
        
        # --- ÖLÇEKLENDİRME DEĞİŞKENLERİ ---
        self.base_width = 1024
        self.base_height = 768
        self.scale_factor = 1.0  # Zoom oranı
        
        self.root.geometry(f"{self.base_width}x{self.base_height}")
        
        # --- DOSYA YOLLARI ---
        if getattr(sys, 'frozen', False):
            self.base_path = os.path.dirname(sys.executable)
        else:
            self.base_path = os.path.dirname(os.path.abspath(__file__))

        self.rekor_dosyasi = os.path.join(self.base_path, "liderler.json")
        self.soru_dosyasi = os.path.join(self.base_path, "sorular.json")
        
        self.img_telefon_path = os.path.join(self.base_path, "telefon.png")
        self.img_yari_path = os.path.join(self.base_path, "yari.png")
        self.img_cift_path = os.path.join(self.base_path, "cift.png")
        
        # --- VERİ YÜKLEME ---
        self.liderler = self._liderleri_yukle()
        self.sorular = self._sorulari_yukle()
        self.toplam_puan = 0
        self.toplam_soru_adedi = self._toplam_soru_sayisini_getir()
        
        self.oyuncu_adi = simpledialog.askstring("GİRİŞ", "Adınızı Yazın:", parent=self.root)
        if not self.oyuncu_adi: self.oyuncu_adi = "Misafir Titan"

        if not self.sorular:
            messagebox.showerror("KRİTİK HATA", f"Soru dosyası bulunamadı!\nAranan Konum: {self.soru_dosyasi}")
            self.root.destroy()
            return

        self.joker_resimleri = {}
        if os.path.exists(self.img_telefon_path): self.joker_resimleri["TELEFON"] = tk.PhotoImage(file=self.img_telefon_path)
        if os.path.exists(self.img_yari_path): self.joker_resimleri["YARI"] = tk.PhotoImage(file=self.img_yari_path)
        if os.path.exists(self.img_cift_path): self.joker_resimleri["CIFT"] = tk.PhotoImage(file=self.img_cift_path)

        for widget in self.root.winfo_children():
            widget.destroy()

        self.canvas = tk.Canvas(root, highlightthickness=0, bg="#000033")
        self.canvas.pack(fill="both", expand=True)
        self.canvas.bind("<Configure>", self._on_resize)

        self.gradient_offset = 0  
        self.animate_background()

        self.secilen_soru_index = 0
        self.jokerler = {"CIFT": False, "YARI": False, "TELEFON": False}
        self.kullanildi = {"CIFT": False, "YARI": False, "TELEFON": False}
        self.garanti_odul = "0 TL"
        self.kalan_sure = 30
        self.timer_id = None
        self.bekleme_aktif = False 
        self.bot_aktif = False
        
        self.oduller = [
            "1.000.000 TL", "500.000 TL", "250.000 TL", "125.000 TL (BARAJ)", "60.000 TL",
            "30.000 TL", "15.000 TL", "7.500 TL (BARAJ)", "5.000 TL", "3.000 TL",
            "2.000 TL", "1.000 TL", "500 TL (BARAJ)", "250 TL", "100 TL"
        ]
        
        self._setup_ui()
        self._setup_resolution_panel() 
        self.soru_yukle()
        self.root.bind("<Control-b>", lambda e: self.botu_baslat())

    def _on_resize(self, event):
        # Zoom Oranını Hesapla
        self.scale_factor = min(event.width / self.base_width, event.height / self.base_height)
        self.canvas.coords(self.window_id, event.width // 2, event.height // 2)
        self._apply_zoom()

    def _apply_zoom(self):
        """Tüm UI elemanlarına font ve boyut zoomu uygular."""
        s = self.scale_factor
        
        # Fontları güncelle
        self.lbl_oyuncu.config(font=("Segoe UI", int(12 * s), "bold"))
        self.lbl_puan.config(font=("Segoe UI", int(12 * s), "bold"))
        self.lbl_rekor.config(font=("Segoe UI", int(12 * s), "bold"))
        self.lbl_havuz.config(font=("Segoe UI", int(10 * s), "bold"))
        self.lbl_sure.config(font=("Segoe UI", int(20 * s), "bold"))
        self.lbl_soru.config(font=("Segoe UI", int(22 * s), "bold"), wraplength=int(700 * s))
        
        for lbl in self.para_etiketleri:
            lbl.config(font=("Segoe UI", int(11 * s), "bold"), width=int(22))
            
        for btn in self.butonlar:
            btn.config(font=("Segoe UI", int(14 * s), "bold"), width=int(50))

    def _setup_ui(self):
        self.main_frame = tk.Frame(self.canvas, bg="#000033", padx=20, pady=20)
        self.window_id = self.canvas.create_window(512, 384, window=self.main_frame, anchor="center")
        self.lbl_secov_logo = tk.Label(self.root, text="", bg="#000033")
        
        self.score_panel = tk.Frame(self.main_frame, bg="#000033")
        self.score_panel.pack(fill="x", side="top", pady=10)
        
        self.lbl_oyuncu = tk.Label(self.score_panel, text=f"👤 {self.oyuncu_adi.upper()}", bg="#000033", fg="#00FFFF")
        self.lbl_oyuncu.pack(side="left", padx=10)
        
        self.lbl_puan = tk.Label(self.score_panel, text="💎 PUAN: 0", bg="#000033", fg="white")
        self.lbl_puan.pack(side="left", padx=15)

        self.lbl_rekor = tk.Label(self.score_panel, text="", bg="#000033", fg="gold")
        self.lbl_rekor.pack(side="left", padx=15)
        self._rekor_yazisini_guncelle()

        self.lbl_havuz = tk.Label(self.score_panel, text=f"📂 {self.toplam_soru_adedi} SORU", bg="#000033", fg="#5555ff")
        self.lbl_havuz.pack(side="left", padx=20)
        
        self.lbl_sure = tk.Label(self.main_frame, text="SÜRE: 30", bg="#000033", fg="#00FF00")
        self.lbl_sure.pack(pady=5)
        
        self.para_frame = tk.Frame(self.main_frame, bg="#00001a")
        self.para_frame.pack(side="right", fill="y", padx=20)
        self.para_etiketleri = []
        for i in range(15):
            lbl = tk.Label(self.para_frame, text=self.oduller[i], bg="#00001a", fg="white", pady=5)
            lbl.pack(pady=1); self.para_etiketleri.append(lbl)
            
        self.oyun_frame = tk.Frame(self.main_frame, bg="#000033")
        self.oyun_frame.pack(side="left", fill="both", expand=True)
        
        self.top_action_frame = tk.Frame(self.oyun_frame, bg="#000033")
        self.top_action_frame.pack(pady=10)

        joker_verileri = [
            ("CIFT", self.kullan_cift, "⚡ 2x"),
            ("YARI", self.kullan_yari, "⚖️ %50"),
            ("TELEFON", self.kullan_telefon, "☎️ Ara")
        ]

        for j_key, cmd, yedek_metin in joker_verileri:
            if j_key in self.joker_resimleri:
                btn = tk.Button(self.top_action_frame, image=self.joker_resimleri[j_key], command=cmd, relief="raised", bd=3, bg="#1a1a4d", activebackground="#FFD700")
            else:
                btn = tk.Button(self.top_action_frame, text=yedek_metin, command=cmd, font=("Segoe UI", 12, "bold"), relief="raised", bd=3, width=6, bg="#1a1a4d", fg="#FFD700", activebackground="#FFD700")
            
            btn.pack(side="left", padx=5)
            if j_key == "CIFT": self.btn_cift = btn
            elif j_key == "YARI": self.btn_yari = btn
            else: self.btn_telefon = btn

        self.btn_restart_main = tk.Button(self.top_action_frame, text="🔄 YENİDEN", command=self._yeniden_baslat, font=("Segoe UI", 10, "bold"), bg="#005500", fg="white", relief="flat", padx=10)
        self.btn_restart_main.pack(side="left", padx=15)

        self.btn_sifirla = tk.Button(self.top_action_frame, text="🗑 SIFIRLA", command=self.rekor_sifirla, font=("Segoe UI", 10, "bold"), bg="#440000", fg="white", relief="flat", padx=10)
        self.btn_sifirla.pack(side="left", padx=5)
            
        self.lbl_soru = tk.Label(self.oyun_frame, text="", bg="#000033", fg="white")
        self.lbl_soru.pack(pady=20)
        self.btn_container = tk.Frame(self.oyun_frame, bg="#000033")
        self.btn_container.pack()
        self.butonlar = []

    def _setup_resolution_panel(self):
        res_frame = tk.Frame(self.root, bg="#1a1a4d", bd=2, relief="ridge")
        res_frame.place(relx=1.0, rely=0.0, anchor="ne", x=-10, y=10)
        
        tk.Label(res_frame, text="EKRAN", font=("Segoe UI", 8, "bold"), bg="#1a1a4d", fg="white").pack(pady=2)
        sizes = [("HD", 1024, 768), ("FHD", 1920, 1080)]
        for label, w, h in sizes:
            btn = tk.Button(res_frame, text=f"{label}", font=("Segoe UI", 7, "bold"),
                            command=lambda width=w, height=h: self.set_resolution(width, height),
                            bg="#000033", fg="#00FFFF", activebackground="#FFD700", width=8)
            btn.pack(side="left", padx=2, pady=2)

    def set_resolution(self, width, height):
        self.root.geometry(f"{width}x{height}")
        self.root.update_idletasks()

    def _toplam_soru_sayisini_getir(self):
        if os.path.exists(self.soru_dosyasi):
            try:
                with open(self.soru_dosyasi, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return len(data) if isinstance(data, list) else 0
            except: return 0
        return 0

    def _sorulari_yukle(self):
        if os.path.exists(self.soru_dosyasi):
            try:
                with open(self.soru_dosyasi, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list) and len(data) >= 1:
                        liste_kopya = data.copy()
                        random.shuffle(liste_kopya)
                        return liste_kopya[:15] if len(liste_kopya) >= 15 else liste_kopya
            except: return []
        return []

    def _liderleri_yukle(self):
        if os.path.exists(self.rekor_dosyasi):
            try:
                with open(self.rekor_dosyasi, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return sorted(data, key=lambda x: x["puan"], reverse=True)
            except: return []
        return []

    def _rekor_yazisini_guncelle(self):
        rekor_sahibi = self.liderler[0]['isim'] if self.liderler else "Yok"
        top_skor = self.liderler[0]['puan'] if self.liderler else 0
        self.lbl_rekor.config(text=f"🏆 REKOR: {top_skor} ({rekor_sahibi})")

    def _skor_kaydet_ve_kontrol(self):
        eski_rekor = self.liderler[0]["puan"] if self.liderler else -1
        yeni_skor = {"isim": self.oyuncu_adi, "puan": self.toplam_puan}
        self.liderler.append(yeni_skor)
        self.liderler = sorted(self.liderler, key=lambda x: x["puan"], reverse=True)[:5]
        
        try:
            with open(self.rekor_dosyasi, "w", encoding="utf-8") as f:
                json.dump(self.liderler, f, ensure_ascii=False, indent=4)
        except: pass
        
        self._rekor_yazisini_guncelle() 
        if self.toplam_puan > eski_rekor:
            self._rekor_kutlamasi(0)
            return True
        return False

    def _rekor_kutlamasi(self, adim):
        if adim < 20:
            renk = random.choice(["gold", "white", "#00FFFF"])
            self.lbl_rekor.config(fg=renk)
            self.root.after(100, lambda: self._rekor_kutlamasi(adim + 1))
        else:
            self.lbl_rekor.config(fg="gold")

    def _oyun_bitir(self, mesaj, secilen_yanlis_ind=None):
        self.bot_aktif = False
        if self.timer_id: self.root.after_cancel(self.timer_id)
        winsound.Beep(300, 500)
        
        dogru_cevap_ind = self.sorular[self.secilen_soru_index]["cevap"]
        dogru_metin = self.sorular[self.secilen_soru_index]["siklar"][dogru_cevap_ind]
        
        for i, btn in enumerate(self.butonlar):
            if i == dogru_cevap_ind:
                btn.config(bg="#00FF00", fg="black") 
            elif i == secilen_yanlis_ind:
                btn.config(bg="#8B0000", fg="white") 
            btn.config(state="disabled")

        self.root.update()
        
        messagebox.showinfo("Oyun Bitti", 
                            f"Sayın {self.oyuncu_adi},\n{mesaj}\n\n"
                            f"--- ÖĞRENELİM ---\n"
                            f"DOĞRU CEVAP: {dogru_metin}\n\n"
                            f"Ödülünüz: {self.garanti_odul}\n"
                            f"Toplam Puan: {self.toplam_puan}")
        
        self._skor_kaydet_ve_kontrol()
        self.show_leaderboard()

    def soru_yukle(self):
        if self.secilen_soru_index == 3: self.garanti_odul = "500 TL"
        elif self.secilen_soru_index == 8: self.garanti_odul = "7.500 TL"
        elif self.secilen_soru_index == 12: self.garanti_odul = "125.000 TL"
        
        self.joker_guncelle(durum="normal")
        if self.timer_id: self.root.after_cancel(self.timer_id)
        self.kalan_sure = 30
        self.lbl_sure.config(text="SÜRE: 30", fg="#00FF00")
        self.sure_guncelle()
        
        for i in range(15):
            if i == (14 - self.secilen_soru_index):
                self.para_etiketleri[i].config(bg="#050550", fg="#FFD700")
            else:
                self.para_etiketleri[i].config(bg="#00001a", fg="white")
        
        self.cift_hakki = False
        self.bekleme_aktif = False
        s = self.sorular[self.secilen_soru_index]
        self.lbl_soru.config(text=f"SORU {self.secilen_soru_index + 1}: {s['soru']}")
        
        for widget in self.btn_container.winfo_children(): widget.destroy()
        self.butonlar = []
        for i in range(4):
            btn = tk.Button(self.btn_container, text=s['siklar'][i], bg="#050550", fg="white", relief="raised", bd=5, activebackground="#FFD700")
            btn.config(command=lambda i=i: self.cevap_kontrol(i))
            btn.pack(pady=5)
            self.butonlar.append(btn)
        
        self._apply_zoom() # Yeni butonlar gelince ölçeği tekrar uygula
        if self.bot_aktif:
            self.root.after(100, self.otomatik_cevapla)

    def cevap_kontrol(self, secim):
        if self.bekleme_aktif: return 
        if self.timer_id: self.root.after_cancel(self.timer_id) 
        self.bekleme_aktif = True
        self.joker_guncelle(durum="bekle")
        for i, b in enumerate(self.butonlar):
            if i != secim: b.config(state="disabled")
        if self.bot_aktif:
            self._dogruluk_onayi(secim)
            return
        
        def heyecan_sesi(n):
            if n > 0:
                winsound.Beep(800 + (3-n)*150, 100)
                self.root.after(1000, lambda: heyecan_sesi(n-1))
        heyecan_sesi(3) 
        self._buton_animasyonu(secim, 0)

    def _dogruluk_onayi(self, secim):
        dogru = self.sorular[self.secilen_soru_index]["cevap"]
        if secim == dogru:
            self.toplam_puan += 1000 + (self.kalan_sure * 50)
            self.lbl_puan.config(text=f"PUAN: {self.toplam_puan}")
            self._odul_parlat(14 - self.secilen_soru_index, 0)
            if not self.bot_aktif:
                self.patlama_efekti_partikul(self.butonlar[secim])
                self._secov_atesle(0)
                self.root.after(1500, self.sonraki_soru)
            else:
                self.sonraki_soru()
        else:
            if hasattr(self, 'cift_hakki') and self.cift_hakki:
                self.cift_hakki = False
                self.butonlar[secim].config(state="disabled", bg="#8B0000")
                for i, b in enumerate(self.butonlar):
                    if i != secim: b.config(state="normal")
                self.sure_guncelle()
                self.bekleme_aktif = False
            else:
                self._oyun_bitir("Yanlış cevap verdiniz!", secim)

    def joker_guncelle(self, durum="normal"):
        soru_no = self.secilen_soru_index + 1
        if soru_no >= 3: self.jokerler["CIFT"] = True
        if soru_no >= 7: self.jokerler["YARI"] = True
        if soru_no >= 12: self.jokerler["TELEFON"] = True
        
        joker_listesi = [("CIFT", self.btn_cift), ("YARI", self.btn_yari), ("TELEFON", self.btn_telefon)]
        for joker_key, btn in joker_listesi:
            if self.kullanildi[joker_key]:
                btn.config(state="disabled", bg="#333", fg="#777")
            elif self.jokerler[joker_key]:
                if durum == "bekle":
                    btn.config(state="disabled", bg="#8B0000", fg="white")
                else:
                    btn.config(state="normal", bg="#1a1a4d")
            else:
                btn.config(state="disabled", bg="#222", fg="#444")

    def sonraki_soru(self):
        self.secilen_soru_index += 1
        if self.secilen_soru_index < len(self.sorular):
            self.soru_yukle()
        else: self.zafer_finali()

    def zafer_finali(self):
        self.bot_aktif = False
        if self.timer_id: self.root.after_cancel(self.timer_id)
        try: winsound.PlaySound("SystemExit", winsound.SND_ALIAS)
        except: pass
        self._skor_kaydet_ve_kontrol() 
        for widget in self.main_frame.winfo_children(): widget.destroy()
        tk.Label(self.main_frame, text="🌟 ŞAMPİYON 🌟", font=("Segoe UI", 36, "bold"), bg="#000033", fg="gold").pack(pady=20)
        self._konfeti_yagmuru(0)
        tk.Button(self.main_frame, text="YENİDEN", command=self._yeniden_baslat, font=("Segoe UI", 16, "bold"), bg="#FFD700", fg="black", padx=30).pack(pady=40)

    def _konfeti_yagmuru(self, adim):
        if adim < 80:
            colors = ["#FFD700", "#FF4500", "#00FF00", "#00FFFF", "#FF69B4", "#FFFFFF"]
            x = random.randint(0, self.root.winfo_width())
            y = random.randint(-200, 0)
            size = random.randint(5, 15)
            p_id = self.canvas.create_oval(x, y, x+size, y+size, fill=random.choice(colors), outline="white", tags="konfeti")
            def dusur(obj_id, hiz_x, hiz_y):
                self.canvas.move(obj_id, hiz_x, hiz_y)
                pos = self.canvas.coords(obj_id)
                if len(pos) >= 2 and pos[1] < self.root.winfo_height():
                    self.root.after(20, lambda: dusur(obj_id, hiz_x, hiz_y))
                else: self.canvas.delete(obj_id)
            dusur(p_id, random.uniform(-2, 2), random.uniform(5, 12))
            self.root.after(80, lambda: self._konfeti_yagmuru(adim + 1))

    def rekor_sifirla(self):
        sifre = simpledialog.askstring("GÜVENLİK", "Şifre:", show="*")
        if sifre == "780878":
            if os.path.exists(self.rekor_dosyasi): os.remove(self.rekor_dosyasi)
            self.liderler = []
            self._rekor_yazisini_guncelle()
            messagebox.showinfo("BAŞARILI", "Rekorlar sıfırlandı!")

    def kullan_telefon(self):
        if self.jokerler["TELEFON"] and not self.kullanildi["TELEFON"]:
            self.kullanildi["TELEFON"] = True; self.joker_guncelle()
            dogru = self.sorular[self.secilen_soru_index]["cevap"]
            messagebox.showinfo("Telefon", f"Uzman: 'Cevap {self.sorular[self.secilen_soru_index]['siklar'][dogru]} bence.'")

    def kullan_cift(self):
        if self.jokerler["CIFT"] and not self.kullanildi["CIFT"]:
            self.kullanildi["CIFT"] = True; self.joker_guncelle(); self.cift_hakki = True

    def kullan_yari(self):
        if self.jokerler["YARI"] and not self.kullanildi["YARI"]:
            self.kullanildi["YARI"] = True; self.joker_guncelle()
            dogru = self.sorular[self.secilen_soru_index]["cevap"]
            kald = 0
            for i in range(4):
                if i != dogru and kald < 2:
                    self.butonlar[i].config(state="disabled", bg="#111", fg="#333"); kald += 1

    def show_leaderboard(self):
        for widget in self.main_frame.winfo_children(): widget.destroy()
        tk.Label(self.main_frame, text="🏆 ŞAMPİYONLAR 🏆", font=("Segoe UI", 32, "bold"), bg="#000033", fg="#FFD700").pack(pady=30)
        list_container = tk.Frame(self.main_frame, bg="#000033")
        list_container.pack(pady=20)
        for i, entry in enumerate(self.liderler):
            tk.Label(list_container, text=f"{i+1}. {entry['isim']} — {entry['puan']}", font=("Segoe UI", 20, "bold"), bg="#000033", fg="white").pack(pady=8)
        tk.Button(self.main_frame, text="YENİ OYUN", command=self._yeniden_baslat, font=("Segoe UI", 16, "bold"), bg="#1a1a4d", fg="white").pack(pady=30)

    def _yeniden_baslat(self):
        if self.timer_id: self.root.after_cancel(self.timer_id)
        self.__init__(self.root)

    def animate_background(self):
        self.gradient_offset = (self.gradient_offset + 0.05) % (2 * math.pi)
        w, h = self.root.winfo_width(), self.root.winfo_height()
        if w > 1: self._draw_gradient(w, h)
        self.root.after(50, self.animate_background)

    def _draw_gradient(self, width, height):
        self.canvas.delete("gradient")
        cx, cy = width / 2, height / 2
        for i in range(0, int(max(width, height)), 20):
            intensity = int(40 + 35 * math.sin(i * 0.01 + self.gradient_offset))
            color = f'#{0:02x}{0:02x}{intensity:02x}'
            self.canvas.create_oval(cx-i, cy-i, cx+i, cy+i, outline=color, width=3, tags="gradient")
        self.canvas.tag_lower("gradient")

    def _buton_animasyonu(self, secim, adim):
        if adim < 30: 
            r, g, b = 255, int(180 + 75 * math.sin(adim * 0.8)), 0
            color = f'#{r:02x}{g:02x}{b:02x}'
            self.butonlar[secim].config(bg=color, relief="sunken")
            self.root.after(100, lambda: self._buton_animasyonu(secim, adim + 1))
        else:
            self.bekleme_aktif = False
            self._dogruluk_onayi(secim)

    def _secov_atesle(self, adim):
        if adim < 15:
            secili_renk = random.choice(["#FF4500", "#FFD700", "#FF0000", "#FFFFFF"])
            self.lbl_secov_logo.config(text="🚀 SECOVVV 🚀", fg=secili_renk, font=("Verdana", int(32 * self.scale_factor), "bold italic"))
            self.lbl_secov_logo.place(relx=0.5, rely=0.1, anchor="center")
            self.root.after(100, lambda: self._secov_atesle(adim + 1))
        else: self.lbl_secov_logo.place_forget()

    def _odul_parlat(self, index, adim):
        if self.bot_aktif: 
            self.para_etiketleri[index].config(bg="#FFD700", fg="black")
            return
        if adim == 0:
            for lbl in self.para_etiketleri: lbl.config(bg="#00001a", fg="white")
        if adim < 10:
            current_color = "#FFFFFF" if adim % 2 == 0 else "#FFD700"
            self.para_etiketleri[index].config(bg=current_color, fg="black")
            self.root.after(100, lambda: self._odul_parlat(index, adim + 1))
        else:
            self.para_etiketleri[index].config(bg="#FFD700", fg="black")

    def sure_guncelle(self):
        if self.kalan_sure > 0:
            self.kalan_sure -= 1
            self.lbl_sure.config(text=f"SÜRE: {self.kalan_sure}")
            if self.kalan_sure <= 10: self.lbl_sure.config(fg="#FF4500")
            self.timer_id = self.root.after(1000, self.sure_guncelle)
        else: self._oyun_bitir("Süreniz doldu!")

    def patlama_efekti_partikul(self, btn): 
        x0 = btn.winfo_rootx() - self.canvas.winfo_rootx() + (btn.winfo_width() // 2)
        y0 = btn.winfo_rooty() - self.canvas.winfo_rooty() + (btn.winfo_height() // 2)
        btn.config(bg="#00FF00", fg="black", text="DOĞRU!")
        self.root.update()
        winsound.Beep(1200, 100); winsound.Beep(1500, 200)
        partikuller = []
        for _ in range(45):
            r, color = random.randint(5, 12), random.choice(["#FFD700", "#FFFFFF", "#FF4500", "#00FF00", "#00FFFF", "#FF69B4"])
            p_id = self.canvas.create_oval(x0-r, y0-r, x0+r, y0+r, fill=color, outline="white", width=1, tags="partikul")
            aci, hiz = random.uniform(0, 2 * math.pi), random.uniform(12, 40)
            partikuller.append((p_id, math.cos(aci) * hiz, math.sin(aci) * hiz))
        def partikul_savur(step):
            if step < 30:
                for p_id, dx, dy in partikuller: self.canvas.move(p_id, dx, dy)
                self.root.after(20, lambda: partikul_savur(step + 1))
            else: self.canvas.delete("partikul")
        partikul_savur(0)

    def botu_baslat(self):
        if self.bekleme_aktif: return
        self.bot_aktif = True
        self.otomatik_cevapla()

    def otomatik_cevapla(self):
        if self.secilen_soru_index < len(self.sorular) and self.bot_aktif:
            dogru_index = self.sorular[self.secilen_soru_index]["cevap"]
            self.root.after(500, lambda: self.cevap_kontrol(dogru_index))

if __name__ == "__main__":
    root = tk.Tk()
    app = MilyonerTitan(root)
    root.mainloop()