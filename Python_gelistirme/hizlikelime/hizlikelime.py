import tkinter as tk
from tkinter import simpledialog, messagebox 
import random
import time
import os
import sys
import winsound
import ctypes 

class SecovTitanGame:
    def __init__(self, root):
        self.root = root
        self.root.title("SECOVVV TITAN v15.0 - DUAL SOURCE + AUDIO")
        self.root.geometry("1200x850") 
        self.root.configure(bg="#191970")

        # --- AKILLI YOL MOTORU (EKLEME) ---
        if getattr(sys, 'frozen', False):
            self.ana_dizin = os.path.dirname(sys.executable)
        else:
            self.ana_dizin = os.path.dirname(os.path.abspath(__file__))

        # Müzik için denenecek yollar (Senin yolun + Otomatik yollar)
        self.olasi_muzik_yollari = [
            r"C:\Users\asgez\OneDrive\Masaüstü\python\muzikler", # Senin orijinal yolun
            os.path.join(self.ana_dizin, "muzikler"),           # Kodun yanındaki klasör
            os.path.join(self.ana_dizin, "dist", "muzikler")    # EXE olursa diye dist içi
        ]
        
        self.muzik_klasoru = ""
        self.muzik_listesi = []
        self.su_anki_index = 0
        self.muzik_caliyor = False
        self.mci = ctypes.windll.winmm.mciSendStringW 

        # --- KELİME KAYNAKLARI (ORİJİNAL) ---
        self.py_kelimeleri = ["akıl", "fikir", "yön", "baş", "son", "ilk", "orta", "düz", "eğri", "dik", "yatık",
  "hafif", "ağır", "sığ", "bol", "az", "çok", "tam", "yarım", "tek", "çift",
  "kalp", "beyin", "el", "ayak", "göz", "kulak", "ağız", "diş", "dil", "saç",
  "ten", "kan", "damar", "kemik", "kas", "sinir", "omuz", "kol", "sırt",
  "karın", "diz", "topuk", "parmak", "tırnak", "yüz", "kaş", "kirpik", "alın",
  "yanak", "çene", "dudak", "yazı", "harf", "hece", "kelime", "cümle", "metin",
  "tarih", "bilim", "sanat", "müzik", "dans", "oyun", "spor", "yüzme", "koşu",
  "atış", "maç", "takım", "gol", "top", "kale", "file", "hakem", "tur", "yolcu",
  "bilet", "uçak", "tren", "gemi", "araba", "otobüs", "taksi", "bisiklet", "motor",
  "liman", "durak", "cadde", "sokak", "meydan", "park", "bahçe", "tarla", "çiftlik",
  "fidan", "meyve", "sebze", "tahıl", "ekmek", "pasta", "börek", "çorba", "et",
  "balık", "tavuk", "yumurta", "süt", "peynir", "yoğurt", "yağ", "bal", "reçel",
  "şeker", "tuz", "çay", "kahve", "elma", "armut", "üzüm", "erik", "vişne",
  "kayısı", "şeftali", "kavun", "karpuz", "çilek", "fındık", "ceviz", "fıstık",
  "badem", "leblebi", "incir", "dut", "hurma", "zeytin", "marul", "lahana",
  "pırasa", "ıspanak", "havuç", "turp", "soğan", "sarımsak", "domates", "patlıcan",
  "kabak", "salatalık", "fasulye", "nohut", "mercimek", "pirinç", "bulgur", "un",
  "nişasta", "sirke", "sos", "fincan", "çaydanlık", "servis", "kanepe", "yorgan",
  "kilim", "resim", "foto", "çerçeve", "vazo", "saksı", "dergi", "gazete", "roman",
  "şiir", "hikaye", "masal", "film", "sahne", "nota", "ritim", "şarkı", "türkü",
  "beste", "konser", "klip", "kayıt", "efekt", "stüdyo", "heykel", "çizim", "tasarım",
  "moda", "giyim", "kumaş", "iplik", "düğme", "fermuar", "cep", "yaka", "etek",
  "pantolon", "ceket", "kazak", "gömlek", "tişört", "mont", "kaban", "hırka",
  "eldiven", "şapka", "atkı", "çorap", "ayakkabı", "bot", "terlik", "sandal",
  "takı", "yüzük", "küpe", "kolye", "bilezik", "gözlük", "kemer", "şemsiye",
  "tarz", "stil", "trend", "ikon", "marka", "lüks", "ucuz", "pahalı", "indirim",
  "fiyat", "kâr", "zarar", "borç", "alacak", "kasa", "banka", "hesap", "bütçe",
  "döviz", "kur", "faiz", "vergi", "kira", "maaş", "ücret", "prim", "iş", "görev",
  "mesai", "izin", "tatil", "kariyer", "terfi", "istifa", "emekli", "yönetim",
  "müdür", "şef", "ekip", "proje", "plan", "hedef", "vizyon", "misyon", "strateji",
  "taktik", "analiz", "rapor", "sunum", "toplantı", "karar", "imza", "belge",
  "dosya", "klasör", "arşiv", "depo", "stok", "nakliye", "ulaşım", "trafik",
  "köprü", "tünel", "hava", "uçuş", "sefer", "rezerv", "otel", "pansiyon",
  "kamping", "turizm", "gezi", "plaj", "doğa", "kayak", "kamp", "çadır", "yürüyüş",
  "tırmanış", "futbol", "basket", "voleybol", "tenis", "boks", "judo", "satranç",
  "tavla", "okey", "kağıt", "zar", "pullar", "oyuncu", "kazanan", "kaybeden",
  "kupa", "madalya", "ödül", "kural", "skor", "puan", "lig", "sezon",
  "golcü", "defans", "forvet", "kaleci", "teknik", "antrenör", "kadro", "yedek",
  "transfer", "kulüp", "taraftar", "stad", "tribün", "seyirci", "kombine", "yayın",
  "kanal", "spiker", "yorum", "haber", "bülten", "manşet", "dakika", "canlı",
  "radyo", "internet", "site", "bağlantı", "blog", "forum", "sosyal", "medya",
  "takip", "beğeni", "paylaş", "mesaj", "sohbet", "video", "filtre", "emoji",
  "buton", "menü", "sayfa", "iletişim", "destek", "yardım", "gizlilik", "şartlar",
  "üye", "kayıt", "giriş", "çıkış", "profil", "ayarlar", "bildirim", "mesajlar",
  "arkadaş", "takipçi", "istek", "engelle", "düzenle", "kaydet", "beğen",
  "ara", "sırala", "tüm", "popüler", "öneri", "kategori",
  "etiket", "arama", "sonuç", "bulundu", "yükle", "tamam", "iptal", "geri", "ileri",
  "başla", "durdur", "oynat", "sessiz", "koyu", "açık", "mod", "gece", "gündüz",
  "otomatik", "indir", "kaldır", "hata", "uyarı", "bilgi", "başarı",
  "şifre", "posta", "telefon", "adres", "şehir", "ilçe", "semt", "takvim", "randevu",
  "hatırlat", "alarm", "sayaç", "yüzde", "kare", "üs", "sabit", "mantık", "değildir", "veya", "artı", "eksi",
  "atama", "değer", "tür", "tip", "kapsam", "modül", "paket", "çerçeve", "platform",
  "sunucu", "istemci", "sorgu", "tablo", "sütun", "satır", "indeks", "abajur", "acente",
  "adım", "afiş", "ağaç", "ahşap", "akşam", "alıcı", "altay", "ambar",
  "anlam", "araba", "aracı", "aralık", "asmak", "avize", "aylak", "ayna", "babam",
  "bahar", "bahçe", "bakır", "balon", "bambu", "banka", "barın", "basit", "batak", "bayan",
  "bebek", "beden", "belek", "belki", "berat", "besin", "beşer", "beyaz", "bıçak",
  "bidon", "bilgi", "bilet", "biraz", "bitki", "biyel", "bizon", "boğaç", "boğaz", "bohem",
  "bolca", "boncuk", "boran", "boyar", "bozuk", "böcek", "bölge", "bölüm", "börek", "böyle",
  "budak", "buğra", "bulut", "burgu", "butik", "buzlu", "büro", "bütün", "büyük",
  "cadde", "cahil", "cami", "canlı", "cazip", "ceviz", "cezve", "cılız", "cilt", "cins",
  "cisim", "cömert", "cüce", "çaba", "çadır", "çakıl", "çalar", "çanta", "çark", "çekiç",
  "çelenk", "çene", "çerez", "çilek", "çim", "çini", "çip", "çizgi", "çoban", "çorba", "çözüm",
  "daire", "dalga", "damar", "damla", "davet", "dayak", "defne", "dekor", "delik", "deniz",
  "dergi", "derin", "diken", "dilek", "dinar", "dizgi", "doğa", "dokuz", "dolap", "donuk",
  "dost", "doyum", "duman", "dünya", "dürüm", "düşük", "ebedi", "ecel", "edep", "efkar",
  "egzoz", "eklem", "ekmek", "elmas", "emlak", "enfes", "engel", "ensiz",
  "erzak", "esans", "esir", "esnaf", "etkin", "evcil", "evrak", "eylem", "fayda", "fener",
  "ferah", "fidan", "fikir", "filiz", "fiske", "fobi", "forma", "fren", "füze",
  "galip", "gaye", "gelin", "gemici", "genel", "gergi", "getiri", "gezgin", "gıda", "giyim",
  "gölet", "görgü", "gövde", "gözcü", "grup", "gübre", "güçlü", "güdü", "gülme", "gümüş",
  "günce", "güven", "güzel", "hacim", "hafıza", "hakem", "halat", "halka", "hamur", "hanım",
  "harbi", "harf", "hasat", "hasta", "hatır", "havuz", "hayal", "hayat", "hazin", "hızlı",
  "hisse", "hizmet", "hoşaf", "hurda", "ıslak", "ışık", "iade", "ibare", "icmal",
  "idrak", "ihbar", "iklim", "ikram", "iktis", "ilahi", "ilham", "ilk", "imal", "imkan",
  "ince", "indir", "iplik", "irfan", "ispat", "işlem", "işsiz", "itaat", "izlem",
  "izmir", "jilet", "judo", "kaba", "kadın", "kafes", "kahve", "kalem", "kalın", "kamış",
  "kanal", "kanat", "kanca", "karde", "karış", "karlı", "kasap", "kase", "katip", "katır",
  "kavak", "kavun", "kayak", "kayık", "kayın", "kazak", "kazan", "kebap", "kefil", "kekik",
  "kelam", "kemer", "kenar", "kepçe", "kerem", "kesik", "kesme", "keşif", "kibar", "kiler",
  "kilit", "kimse", "kira", "kiraz", "kirli", "kısır", "kışla", "kitle", "kivi", "klasör",
  "klima", "koçak", "kofre", "kokte", "kolay", "kolej", "kolye", "komik", "konak", "konu",
  "kopuk", "korna", "koyun", "köfte", "köprü", "köy", "kredi", "krema", "kriz", "kroki",
  "kule", "kulüp", "kumru", "kural", "kurgu", "kurma", "kusur", "kutu", "küçük",
  "küp", "kürsü", "lamba", "lanet", "lazım", "lehim", "liman",
  "lira", "liste", "lokma", "lokum", "lombo", "lütuf", "maçka", "madde", "mahir",
  "makam", "maket", "makro", "malik", "manav", "mango", "manşet", "mantar", "marul", "masal",
  "maske", "matem", "matiz", "mazot", "melek", "melik", "menü", "merak", "mermi", "mesaj",
  "mesai", "metal", "metin", "mezar", "mezun", "mihrap", "mikro", "milat", "milim", "minik",
  "misal", "misir", "mitoz", "modül", "molla", "mont", "moruk", "motif", "motor",
  "muhit", "mumya", "murat", "muska", "mutlu", "muzlu", "nabız", "nakil", "nakit", "namaz",
  "narin", "nazik", "neden", "nefes", "nehir", "nemli", "nesil", "nesne", "net", "nitel",
  "niyet", "nizam", "nokta", "not", "nüfus", "obje", "ocak", "odun", "ofis", "okuma", "okyan",
  "olası", "olmaz", "omlet", "onluk", "opera", "oran", "ordu", "organ", "ortak", "otlak",
  "otluk", "oymak", "ozan", "özgür", "özlem", "özlük", "paket", "palet", "palto", "pamuk",
  "panda", "panel", "panik", "papel", "parça", "parke", "parti", "patik", "patlı", "payda",
  "payet", "pekin", "pelin", "pençe", "perde", "peron", "petek", "piyan", "pirin", "plaka",
  "plan", "plaza", "polis", "pompa", "posta",  "prens", "proje", "puan", "puset",
  "radar", "radyo", "raf", "rahim", "rakip", "ramak", "rampa", "ranza", "rapor", "resim",
  "ritim", "robot", "rol", "roman", "rota", "ruhsat", "rulo", "rumuz", "rüya", "sabır",
  "sabit", "safra", "sahne", "sahur", "sakız", "salon", "salto", "saman", "sanat", "saray",
  "sarı", "sarma", "satır", "sauna", "sayfa", "sayım", "seçim", "sefer", "sehim", "sekiz",
  "selam", "selvi", "sepet", "serap", "serin", "serum", "sesli", "setir", "sevap", "seyir",
  "sıcak", "sıfat", "sıkma", "simit", "sinir", "siper", "siren", "sistem", "sofra",
  "soğuk", "sokak", "sokum", "solak", "sonar", "sonuç", "sorgu", "soyut", "sözlük",
  "spiker", "spor", "suçlu", "suluk", "sumak", "sunum", "surat", "susam", "sütun", "şahin",
  "şapka", "şarkı", "şeker", "şemsi", "şifre", "şubat", "şüphe", "tabak", "taban", "tabip",
  "tablo", "tabur", "tacir", "tahta", "takım", "takip", "taksi", "talep", "talih",
  "tamir", "tanım", "taraf", "tarım", "tasar", "tatlı", "tavır", "tavuk", "tayfa", "tayin",
  "teker", "tekil", "tekne", "telin", "temel", "tempo", "tenis", "tesis", "testi", "tetik",
  "tezat", "tıbbi", "ticari", "tiger", "tikel", "tilki", "tiner", "tipik", "tiraj", 
  "tohum", "tokat", "tomar", "tonaj", "topak", "topla", "torna", "torun", "tufan", "elida",
  "emel", "seçkin", "osman", "korkak", "anakart", "işlemci", "casio", "abaküs", "abla", "abiye", 
  "acı", "acil", "açlık", "ada", "adak", "adale", "adam", "aday", "adet", "af", "afiş", "ağ", 
  "ağaç", "ağrı", "ahenk", "ahize", "aile", "ak", "akçe", "akın", "akrep", "aksak", "aksiyon", 
  "aktar", "akü", "al", "ala", "alaka", "alan", "alay", "alçı", "alem", "alev", "algı", "alıcı", 
  "alim", "alış", "alkış", "allı", "alp", "alt", "altı", "ama", "aman", "amaç", "amber", "amca", 
  "amir", "amorf", "ana", "anı", "anlık", "anma", "ansız", "ant", "anut", "apak", "apart", "apiko", 
  "ara", "aralık", "arayış", "arda", "arı", "arıza", "arzu", "as", "asalak", "asansör", "asıl", 
  "asit", "askı", "aslı", "asma", "aş", "aşama", "aşçı", "aşk", "aşlık", "aşure", "at", "ata",
  "atar", "atık", "atış", "atkı", "atlas", "atlı", "av", "avanak", "avare", "avaz", "avcı", 
  "avuç", "ay", "ayak", "ayar", "ayaz", "aygın", "aylak", "ayna", "ayrı", "az", "azade", "azam",  
  "azap", "azı", "azim", "aziz", "baba", "baca", "bacı", "bağ", "bağdaş", "bahçe", "bahis",
  "bahşiş", "bak", "bakal", "bakar", "bakış", "bal", "balaban", "balcı", "balık", "balk", 
  "balya", "ban", "bandı", "bar", "baraj", "barış", "bark", "barut", "bas", "basak", "basar", 
  "bası", "baskı", "basma", "baston", "basur", "baş", "başta", "bat", "batak", "batar", "batur", 
  "bay", "bayat", "baygın", "bayır", "baykuş", "bayrak", "baz", "bazı", "beceri", "bedel", 
  "beden", "beis", "bek", "bekar", "beklenti", "bela", "belde", "belek", "belik", "belirsiz", 
  "belli", "bellek", "bemol", "ben", "bencik", "bende", "beniz", "bent", "beraat", "berbat",
  "bere", "berk", "besin", "beste", "beş", "beşer", "bet", "beton", "bey", "beyin", "beyit", 
  "bez", "bezir", "bıçkı", "bıkkın", "bıyık", "bıçak", "bıldır", "bıkma", "bilye", "bina", "bir", 
  "birim", "birli", "bit", "bitik", "bitim", "bitiş", "bitki", "bizon", "bıyık", "boş", "boğa",
  "boğum", "bohem", "bol", "bor", "boru", "boy", "boya", "boyun", "boz", "bozak", "bu", "bucak",
  "buda", "buğu", "buhran", "buhur", "bul", "bulak", "bulanık", "bulgur", "buluş", "bulut",
  "bun", "burgu", "burun", "buz", "büro", "bük", "bükük", "bülbül", "bürüm", "bütçe", "bütün",
  "büyü", "büyük", "cadı", "cam", "camcı", "can", "cıva", "cılız", "cıvık", "cibre", "ciddî",
  "cihan", "cilt", "cin", "cins", "cirit", "cıvata", "cıvıl", "cıvıt", "cız", "cızırtı",
  "cıvıltı", "cüce", "cüret", "cüzdan", "çaba", "çakı", "çakıl", "çakır", "çalak", "çalı",
  "çam", "çamur", "çanak", "çapar", "çap", "çapraş", "çar", "çarık", "çark", "çatı", "çatık", 
  "çay", "çayır", "çeki", "çelik", "çeltik", "çene", "çeper", "çeşit", "çetin", "çığ", 
  "çığlık", "çıka", "çıkış", "çılgın", "çın", "çırak", "çıtır", "çit", "çivi", "çizgi", "çizik",
  "çok", "çorap", "çörek", "çökek", "çözüm", "çöp", "çöplük", "çöl", "çubuk", "çukur",
  "çul", "çuval", "dağ", "dağcı", "dahil", "dahi", "daire", "dakik", "dal", "dalak", "dalga",
  "dalık", "dalış", "dalya", "dam", "damak", "damar", "damla", "dana", "danış", "dar", "darbe",
  "daş", "dava", "dayı", "de", "debi", "defa", "defi", "değen", "değer", "değişim", 
  "değir", "değnek", "deh", "deha", "dek", "del", "delik", "deli", "delta", "dem",
  "demek", "demet", "demir", "denk", "derin", "dert", "derya", "deste", "dev", "deva",
  "devir", "dış", "dıvrak", "dıh", "dıl", "dıraz", "dır", "di", "dibek", "didiş", "diğ",
  "dik", "dika", "dikiş", "dikme", "dikta", "dil", "dilek", "dilim", "dilsiz", "dimağ",
  "din", "dindi", "dini", "dip", "dirhem", "diri", "diş", "dışarı", "diz", "dizge",
  "dizi", "doğa", "doğaç", "doğan", "doğar", "doğru", "doğu", "doku", "dokuz", "dolak",
  "dolan", "dolar", "dolay", "dolgu", "dolma", "dolu", "don", "donan", "donuk", "dop", 
  "doruk", "dost", "doygun", "doyum", "doz", "dölek", "dön", "dönüm", "dönüş", "dört", 
  "düş", "düşey", "düşük", "düşün", "düz", "düze", "ebabil", "ebat", "ebedi", "ece", "ecel", 
  "ecnebi", "eda", "edep", "edim", "edit", "efendi", "efsane", "egzoz", "eğim", "eğin", "eğir", 
  "eğlence", "eğme", "eğri", "ehil", "eke", "ekim", "ekin", "eklem", "ekli", "ekmek", "ekran", 
  "eksik", "el", "ela", "elçi", "elde", "elek", "eleman", "elen", "elips", "elişi", "elmas", "elti",
  "em", "emare", "emay", "emel", "emin", "emir", "emiş", "emlak", "emme", "emzik", "en", "enayi",
  "encam", "endam", "endişe", "enes", "engel", "enik", "enli", "enser", "ente", "enzim", "epey",
  "epic", "epo", "er", "ergin", "erik", "erim", "erin", "eriş", "erk", "erke", "erlik", "erme",
  "erzak", "es", "esans", "esaret", "esek", "eser", "esin", "esir", "eski", "esme", "esnaf",
  "espri", "esrik", "esse", "estetik", "eş", "eşek", "eşik", "eşin", "eşit", "eşleme", "eşlik", "eşya", 
  "et", "etajer", "etek", "etil", "etim", "etki", "etli", "etmen", "etnik", "ev", "evcil", "evel", "evet",
  "evgi", "evik", "evir", "evlek", "evli", "evrak", "evren", "evrim", "evvel", "ey", "eyvah", "eylül",
  "eylem", "ezan", "ezgi", "ezik", "ezme", "fabrika", "facia", "fail", "fakir", "fal", "falaka", "fam",
  "fan", "fani", "fanus", "far", "faraş", "fark", "farz", "fasıl", "fasit", "faska", "faul", "fay", "fayda",
  "faz", "fazla", "fehim", "fek", "felak", "fena", "fener", "fer", "ferah", "ferdi", "fere", "feri", "feryat",
  "fes", "fesat", "fetih", "fetiş", "fevri", "feyz", "fıçı", "fidan", "fıkra", "fındık", "fırça", "fırın", 
  "fırlak", "fısıltı", "fıtık", "fikir", "fiil", "fil", "filiz", "filmi", "final", "firar", "fire", "fiske",
  "fiş", "fit", "fitil", "fitne", "fiya", "fizik", "fobi", "fol", "fon", "forma", "fors", "fos", "foya", 
  "fren", "füze", "gaga", "gahi", "gaip", "galip", "gam", "gar", "garaj", "garb", "gari", "gaye", 
  "gayet", "gayrı", "gaz", "gaza", "gazi", "gebre", "gece", "gedik", "gelin", "gem", "gemi", "gen",
  "genel", "geniş", "gerdek", "gergi", "geri", "germe", "gıdı", "gıda", "gıyap", "gidiş", "gir",
  "girdi", "gidi", "git", "giz", "gizem", "göbek", "göç", "göçer", "gölge", "gömme", "gömüt",
  "gönül", "göre", "görev", "görgü", "görü", "görüm", "gövde", "göz", "gözcü", "grizu", "grup",
  "gübre", "güce", "güçlü", "güdük", "güdü", "güher", "gül", "güleç", "gülen", "gülme", "gülü",
  "gümüş", "gün", "günce", "günde", "güneş", "gür", "gürültü", "güve", "güven", "güverte", "güz",
  "güzel", "hacim", "had", "hadis", "hafız", "hafif", "hak", "hakan", "hakem", "hal", "hala",
  "halat", "halk", "halka", "halta", "ham", "hamam", "hamla", "hamur", "han", "hane", "hani", 
  "hantal", "hap", "haraç", "haram", "harbi", "harf", "harı", "harita", "has", "hasat", "hasen", "haset",
  "hasır", "hasım", "hasis", "hasret", "hasta", "hata", "hatır", "hattı", "hava", "havale", "havan", "havlu",
  "havuz", "hay", "haya", "hayal", "hayat", "haydar", "hayır", "haylaz", "hayli", "hayta", "hazır", "hece", 
  "hedef", "heder", "hekim", "helal", "hele", "helva", "hem", "hemen", "hepsi", "her", "hesap", "heves", "hey",
  "heybe", "heyet", "hız", "hızar", "hızlı", "hile", "hır", "hırs", "hıyar", "his", "hisse", "hit", "hitap", "hız",
  "hoca", "hod", "hol", "hor", "horoz", "hoş", "hu", "hudut", "hukuk", "hulusi", "huni", "hurafe", "hurda", "hurma", 
  "husus", "huzur", "hücum", "hülya", "hüner", "hür", "hüsran", "ızgara", "ırak", "ıslak", "ısrar", "ısı", "ışık",
  "iade", "ibare", "ibiş", "iblağ", "ibra", "ibret", "ibrik", "icap", "icazet", "icra", "idare", "iddi", "idrak", 
  "ifa", "ifade", "iflah", "iflas", "ifrit", "iftar", "iğne", "ihale", "ihbar", "ihlas", "ihraç", "ihtilal", "ihtiyar",
  "ihtiras", "ihtar", "ihvan", "iki", "ikile", "iklim", "ikmal", "ikon", "ikram", "iktisat", "iktifa", "ilahi", 
  "ilam", "ilan", "ilave", "ilçe", "ilde", "ile", "ilham", "ilik", "ilim", "ilke", "ilmek", "im", "imaj", "imal",
  "imam", "imar", "imdat", "imge", "imkan", "imleç", "imza", "in", "inat", "inci", "incir", "indif", "indir",
  "inek", "inilti", "inin", "inis", "inme", "inşah", "inzal", "ip", "ipi", "iplik", "irade", "irfan", "iri",
  "irtifa", "is", "isabet", "ishak", "isim", "iskan", "iskele", "iskil", "islak", "ispat", "israf", "istif",
  "istik", "istina", "iş", "işçi", "işgal", "işık", "işlem", "işsiz", "it", "itaat", "itici", "itik", "itil",
  "itiş", "itme", "iz", "izabe", "izah", "izam", "izin", "izlem", "izle", "izzet", "jant", "jarse", "jel", 
  "jilet", "jöle", "jüri", "kaan", "kaba", "kabak", "kabil", "kabin", "kabir", "kablo", "kabuk", "kabul",
  "kaç", "kaçak", "kaçar", "kaçış", "kadayıf", "kadeh", "kader", "kadı", "kadim", "kadir", "kadro", "kafes",
  "kafi", "kafur", "kağıt", "kahır", "kahve", "kahya", "kaide", "kakao", "kakma", "kala", "kalay", "kalbur",
  "kaldı", "kalem", "kalfa", "kalın", "kalıp", "kalıt", "kalkan", "kalkış", "kalkü", "kallavi", "kalma", 
  "kalori", "kalp", "kalsit", "kalya", "kam", "kama", "kamçı", "kamelya", "kamış", "kamp", "kamus", "kan",
  "kanaat", "kanal", "kanat", "kanca", "kancık", "kandil", "kanıt", "kanka", "kannı", "kanun", "kap", "kapak", 
  "kapan", "kapı", "kapik", "kapma", "kaptan", "kar", "kara", "karaca", "karak", "karar", "karda", "kardeş",
  "karı", "karık", "karın", "karıntı", "karış", "karlı", "karma", "karne", "karot", "karşı", "kart", "kartal",
  "karton", "karum", "karun", "kas", "kasa", "kasap", "kase", "kaset", "kasık", "kasım", "kasıt", "kask", "kaslı",
  "kasma", "kasnak", "kast", "kaş", "kaşağı", "kaşar", "kaşık", "kaşkor", "kaşmir", "kat", "kata", "katı", "katık",
  "katil", "katip", "katkı", "katla", "katlı", "katma", "katot", "kav", "kava", "kavak", "kaval", "kavas",
  "kavga", "kavik", "kavim", "kavun", "kavur", "kaya", "kayak", "kayan", "kaygı", "kayık", "kayın", "kayır",
  "kayış", "kayit", "kayma", "kaz", "kaza", "kazak", "kazan", "kazı", "kazık", "kazma", "kebap", "kebir", 
  "keçe", "keçeli", "keçi", "keder", "kedi", "kefal", "kefen", "kefil", "kek", "kekik", "keklik", "kel",
  "kelebek", "kelek", "kelem", "kelime", "kelle", "kem", "keman", "kement", "kemer", "kemik", "kemre", 
  "kenar", "kene", "kent", "kepçe", "kepenk", "kerde", "kere", "kerem", "kerhane", "kerpiç", "kerr",
  "kerti", "kes", "kesat", "keser", "kesi", "kesik", "kesin", "kesir", "kesit", "keskin", "kesme",
  "keş", "keşif", "keşiş", "ket", "kete", "keten", "keyif", "kıble", "kıdem", "kıdım", "kıh", "kıla",
  "kılar", "kılıç", "kılıf", "kılık", "kılıs", "kımıl", "kın", "kına", "kınama", "kıpır", "kıraç",
  "kırağı", "kiral", "kiraz", "kirli", "kirpi", "kısa", "kısaca", "kısım", "kısır", "kısıt", "kısma",
  "kış", "kışla", "kıta", "kıtık", "kıvanç", "kıvrım", "kıyak", "kıyam", "kıyma", "kıymet", "kıyım"]
        self.dosya_adi = "diskelimeler.txt"
        # .txt dosyasını da akıllı bulur
        self.dosya_path = os.path.join(self.ana_dizin, self.dosya_adi)
        if not os.path.exists(self.dosya_path):
            self.dosya_path = os.path.join(os.getcwd(), self.dosya_adi)

        self.aktif_kaynak = "PY" 
        self.kelimeler = self.py_kelimeleri.copy()

        # --- LOGO ART (ORİJİNAL) ---
        self.logo_art = """
        ███████╗███████╗ ██████╗ ██████╗ ██╗   ██╗██╗   ██╗██╗   ██╗
        ██╔════╝██╔════╝██╔════╝██╔═══██╗██║   ██║██║   ██║██║   ██║
        ███████╗█████╗  ██║     ██║   ██║██║   ██║██║   ██║██║   ██║
        ╚════██║██╔══╝  ██║     ██║   ██║╚██╗ ██╔╝╚██╗ ██╔╝╚██╗ ██╔╝
        ███████║███████╗╚██████╗╚██████╔╝ ╚████╔╝   ╚████╔╝   ╚████╔╝ 
        ╚══════╝╚══════╝ ╚═════╝ ╚═════╝   ╚═══╝     ╚═══╝     ╚═══╝  
        """

        # Oyun Değişkenleri (ORİJİNAL)
        self.toplam_dogru = 0
        self.toplam_yanlis = 0
        self.genel_toplam_karakter = 0
        self.oyun_suresi = 60
        self.kalan_sure = self.oyun_suresi
        self.oyun_aktif = False
        self.ilk_tus_basildi = False
        self.kelime_yazilmaya_baslandi = False
        self.bot_aktif = False 
        self.bot_mu_kullandi = False 
        
        self.rekor_wpm, self.rekor_kelime = self.rekor_oku()

        # UI ve Başlatma
        self._setup_ui()
        self.muzik_listesini_tara()
        self.yeni_kelime()
        self.update_kelime_label_timer()
        self.entry_tahmin.focus_set()

    def _setup_ui(self):
        self.container = tk.Frame(self.root, bg="#191970")
        self.container.pack(fill="both", expand=True)

        self.left_panel = tk.Frame(self.container, bg="#191970")
        self.left_panel.pack(side="left", fill="both", expand=True)
        
        self.top_bar = tk.Frame(self.left_panel, bg="#010101")
        self.top_bar.pack(pady=10, padx=30, fill="x")
        
        self.rekor_frame = tk.Frame(self.top_bar, bg="#010101")
        self.rekor_frame.pack(side="left", padx=20)
        
        self.lbl_rekor_wpm = tk.Label(self.rekor_frame, text=f"🏆 {self.rekor_wpm} WPM", font=("Segoe UI", 38, "bold"), bg="#010101", fg="#FFD700")
        self.lbl_rekor_wpm.pack(anchor="w")
        
        self.lbl_rekor_kelime = tk.Label(self.rekor_frame, text=f"🎯 REKOR: {self.rekor_kelime} KELİME", font=("Segoe UI", 25, "bold"), bg="#010101", fg="#00FF7F")
        self.lbl_rekor_kelime.pack(anchor="w")

        self.lbl_main_logo = tk.Label(self.top_bar, text=self.logo_art, font=("Courier", 6, "bold"), bg="#010101", fg="#222", justify="center")
        self.lbl_main_logo.place(relx=0.48, rely=0.5, anchor="center")

        self.lbl_sure = tk.Label(self.top_bar, text=f"{self.kalan_sure}", font=("Segoe UI", 55, "bold"), bg="#010101", fg="#00E5FF")
        self.lbl_sure.pack(side="right", padx=20)

        self.crown_frame = tk.Frame(self.left_panel, bg="#191970")
        self.crown_frame.pack(pady=5)
        self.lbl_crown_icon = tk.Label(self.crown_frame, text="👑", font=("Segoe UI", 40), bg="#191970", fg="#222")
        self.lbl_crown_icon.pack()
        self.lbl_crown_text = tk.Label(self.crown_frame, text="SISTEM BEKLEMEDE", font=("Consolas", 12, "bold"), bg="#191970", fg="#222")
        self.lbl_crown_text.pack()

        self.lbl_kaynak = tk.Label(self.left_panel, text="MOD: PYTHON (DAHİLİ)", font=("Consolas", 11, "bold"), bg="#191970", fg="#00FF7F")
        self.lbl_kaynak.pack(pady=5)

        self.main_display = tk.Frame(self.left_panel, bg="#080808", highlightbackground="#222", highlightthickness=2)
        self.main_display.pack(pady=10, padx=30, fill="both", expand=True)
        
        self.lbl_kelime_timer = tk.Label(self.main_display, text="READY", font=("Consolas", 35, "bold"), bg="#080808", fg="#444")
        self.lbl_kelime_timer.place(relx=0.5, rely=0.15, anchor="center")

        self.lbl_kelime = tk.Label(self.main_display, text="SISTEM_HAZIR", font=("Segoe UI", 85, "bold"), bg="#080808", fg="#FFFFFF")
        self.lbl_kelime.place(relx=0.5, rely=0.45, anchor="center")
        
        self.lbl_wpm = tk.Label(self.main_display, text="0 WPM", font=("Segoe UI", 40, "bold"), bg="#080808", fg="#00E5FF")
        self.lbl_wpm.pack(side="bottom", pady=15)

        self.entry_tahmin = tk.Entry(self.left_panel, font=("Segoe UI", 50, "bold"), justify="center", bg="#151515", fg="#2ECC71", insertbackground="#2ECC71", bd=0, highlightthickness=2, highlightbackground="#444")
        self.entry_tahmin.pack(pady=20, padx=50, fill="x")

        self.bottom_bar = tk.Frame(self.left_panel, bg="#010101")
        self.bottom_bar.pack(fill="x", padx=30, pady=10)
        
        self.lbl_d_y = tk.Label(self.bottom_bar, text="✅ 0  ❌ 0", font=("Consolas", 20), bg="#010101", fg="#AAA")
        self.lbl_d_y.pack(side="left")

        # Müzik Kontrolleri
        self.music_frame = tk.Frame(self.bottom_bar, bg="#010101")
        self.music_frame.pack(side="left", padx=40)
        
        tk.Button(self.music_frame, text="⏮", bg="#222", fg="#EEE", bd=0, command=self.muzik_geri).pack(side="left", padx=2)
        self.btn_play = tk.Button(self.music_frame, text="▶ PLAY", font=("Segoe UI", 9, "bold"), bg="#2ECC71", fg="#000", bd=0, padx=10, command=self.muzik_cal_duraklat)
        self.btn_play.pack(side="left", padx=2)
        tk.Button(self.music_frame, text="⏭", bg="#222", fg="#EEE", bd=0, command=self.muzik_ileri).pack(side="left", padx=2)
        
        self.lbl_muzik_adi = tk.Label(self.bottom_bar, text="Müzik: Bekliyor", font=("Consolas", 9), bg="#010101", fg="#555")
        self.lbl_muzik_adi.pack(side="left")

        # Butonlar
        self.btn_reset = tk.Button(self.bottom_bar, text="🔄 RESET", font=("Segoe UI", 11, "bold"), bg="#222", fg="#EEE", command=self.reset_game, bd=0, padx=15, pady=5)
        self.btn_reset.pack(side="right")
        self.btn_rekor_reset = tk.Button(self.bottom_bar, text="🗑️ REKORU SİL", font=("Segoe UI", 11, "bold"), bg="#7B0000", fg="#EEE", command=self.rekor_sifirla_sifreli, bd=0, padx=15, pady=5)
        self.btn_rekor_reset.pack(side="right", padx=10)
        self.btn_py_source = tk.Button(self.bottom_bar, text="🐍 PY", font=("Segoe UI", 11, "bold"), bg="#3776AB", fg="#EEE", command=self.set_source_py, bd=0, padx=15, pady=5)
        self.btn_py_source.pack(side="right", padx=5)
        self.btn_txt_source = tk.Button(self.bottom_bar, text="📝 KELİME", font=("Segoe UI", 11, "bold"), bg="#2ECC71", fg="#000", command=self.set_source_txt, bd=0, padx=15, pady=5)
        self.btn_txt_source.pack(side="right", padx=5)

        self.result_overlay = tk.Frame(self.main_display, bg="#050505")

        self.entry_tahmin.bind("<Key>", self.tus_takibi)
        self.entry_tahmin.bind("<Return>", lambda e: self.kontrol_et())
        self.root.bind("<F4>", lambda e: self.start_bot())

    # --- AKILLI MÜZİK MOTORU ---
    def muzik_listesini_tara(self):
        bulundu = False
        for yol in self.olasi_muzik_yollari:
            if os.path.exists(yol):
                self.muzik_klasoru = yol
                self.muzik_listesi = [f for f in os.listdir(yol) if f.lower().endswith(".mp3")]
                if self.muzik_listesi:
                    self.lbl_muzik_adi.config(text=f"Müzik: {len(self.muzik_listesi)} Dosya Hazır", fg="#00FF7F")
                    bulundu = True
                    break
        if not bulundu:
            self.lbl_muzik_adi.config(text="KLASÖR BULUNAMADI!", fg="#FF3131")

    def muzik_cal(self, index):
        if not self.muzik_listesi: return
        self.su_anki_index = index % len(self.muzik_listesi)
        dosya_adi = self.muzik_listesi[self.su_anki_index]
        tam_yol = os.path.join(self.muzik_klasoru, dosya_adi)
        short_path = ctypes.create_unicode_buffer(260)
        ctypes.windll.kernel32.GetShortPathNameW(tam_yol, short_path, 260)
        self.mci("close titan_audio", None, 0, 0)
        self.mci(f'open {short_path.value} alias titan_audio', None, 0, 0)
        self.mci("play titan_audio", None, 0, 0)
        self.muzik_caliyor = True
        self.btn_play.config(text="⏸ PAUSE", bg="#E74C3C")
        self.lbl_muzik_adi.config(text=f"Çalıyor: {dosya_adi[:20]}...", fg="#00E5FF")

    def muzik_cal_duraklat(self):
        if not self.muzik_listesi: 
            messagebox.showwarning("HATA", "Müzik bulunamadı!")
            return
        if self.muzik_caliyor:
            self.mci("pause titan_audio", None, 0, 0); self.muzik_caliyor = False
            self.btn_play.config(text="▶ PLAY", bg="#2ECC71")
        else:
            if "Çalıyor" in self.lbl_muzik_adi.cget("text"):
                self.mci("play titan_audio", None, 0, 0); self.muzik_caliyor = True
                self.btn_play.config(text="⏸ PAUSE", bg="#E74C3C")
            else: self.muzik_cal(0)

    def muzik_ileri(self): self.muzik_cal(self.su_anki_index + 1)
    def muzik_geri(self): self.muzik_cal(self.su_anki_index - 1)

    # --- KAYNAK YÖNETİMİ (ORİJİNAL) ---
    def set_source_py(self):
        self.aktif_kaynak = "PY"; self.kelimeler = self.py_kelimeleri.copy()
        self.lbl_kaynak.config(text="MOD: PYTHON (DAHİLİ)", fg="#00FF7F"); self.reset_game()
        messagebox.showinfo("BİLGİ", "Python listesine geçildi!")

    def set_source_txt(self):
        if not os.path.exists(self.dosya_path):
            messagebox.showerror("HATA", f"Dosya bulunamadı: {self.dosya_adi}")
            return
        try:
            with open(self.dosya_path, "r", encoding="utf-8") as f:
                icerik = [line.strip().lower() for line in f.readlines() if line.strip()]
                if icerik:
                    self.kelimeler = icerik; self.aktif_kaynak = "TXT"
                    self.lbl_kaynak.config(text=f"MOD: {self.dosya_adi} ({len(self.kelimeler)} KELİME)", fg="#FFD700")
                    self.reset_game(); messagebox.showinfo("BAŞARILI", f"{len(self.kelimeler)} kelime yüklendi!")
        except Exception as e: messagebox.showerror("HATA", f"Okuma hatası: {e}")

    # --- OYUN MANTIĞI VE BOT (ORİJİNAL) ---
    def start_bot(self):
        if not self.oyun_aktif: self.tus_takibi(None) 
        if not self.bot_aktif:
            self.bot_aktif = True; self.bot_mu_kullandi = True; self.auto_bot_mode()

    def auto_bot_mode(self):
        if self.oyun_aktif and self.bot_aktif:
            k = self.secilen_kelime
            self.genel_toplam_karakter += (len(k) + 1); self.toplam_dogru += 1
            self.entry_tahmin.delete(0, 'end'); self.entry_tahmin.insert(0, k)
            self.hata_kontrol(); self.lbl_d_y.config(text=f"✅ {self.toplam_dogru}  ❌ {self.toplam_yanlis}")
            self.yeni_kelime()
            if self.kalan_sure > 0: self.root.after(100, self.auto_bot_mode)

    def vortex_update(self, wpm):
        if wpm > 120: c, s = "#FF3131", "VORTEX MODE"
        elif wpm > 60: c, s = "#FFD700", "KING ASCENDING"
        elif wpm > 0: c, s = "#00E5FF", "WARMING UP"
        else: c, s = "#222222", "SISTEM BEKLEMEDE"
        self.lbl_main_logo.config(fg=c); self.lbl_crown_icon.config(fg=c); self.lbl_crown_text.config(fg=c, text=s)

    def ekran_sars(self, count=5):
        if count > 0:
            x, y = random.randint(-4, 4), random.randint(-4, 4)
            try:
                self.root.geometry(f"+{self.root.winfo_x()+x}+{self.root.winfo_y()+y}")
                self.root.after(15, lambda: self.ekran_sars(count-1))
            except: pass

    def yeni_kelime(self):
        if not self.kelimeler: self.kelimeler = ["hata"]
        self.secilen_kelime = random.choice(self.kelimeler)
        self.lbl_kelime.config(text=self.secilen_kelime.upper(), fg="#FFFFFF")
        self.entry_tahmin.delete(0, 'end'); self.kelime_yazilmaya_baslandi = False 

    def tus_takibi(self, event):
        if event and event.keysym == "F4": return
        if not self.ilk_tus_basildi:
            self.ilk_tus_basildi = True; self.oyun_aktif = True; self.geri_sayim()
        if not self.kelime_yazilmaya_baslandi:
            self.kelime_baslangic = time.time(); self.kelime_yazilmaya_baslandi = True
        self.root.after(1, self.hata_kontrol)

    def hata_kontrol(self, event=None):
        yazilan = self.entry_tahmin.get()
        if not self.bot_aktif:
            if not self.secilen_kelime.startswith(yazilan):
                self.entry_tahmin.config(fg="#FF3131"); self.lbl_kelime.config(fg="#FF3131"); self.ekran_sars(2)
            elif yazilan == "": self.lbl_kelime.config(fg="#FFFFFF")
            else: self.entry_tahmin.config(fg="#2ECC71"); self.lbl_kelime.config(fg="#2ECC71")
        if self.oyun_aktif:
            gecen = max(0.1, self.oyun_suresi - self.kalan_sure)
            hiz = int((self.genel_toplam_karakter / 5) / (gecen / 60))
            self.lbl_wpm.config(text=f"{hiz} WPM"); self.vortex_update(hiz)

    def update_kelime_label_timer(self):
        if self.oyun_aktif and self.kelime_yazilmaya_baslandi:
            gecen = time.time() - self.kelime_baslangic
            self.lbl_kelime_timer.config(text=f"{gecen:.2f}s", fg="#FFD700")
        self.root.after(30, self.update_kelime_label_timer)

    def geri_sayim(self):
        if self.kalan_sure > 0 and self.oyun_aktif:
            self.kalan_sure -= 1; self.lbl_sure.config(text=f"{self.kalan_sure}")
            self.root.after(1000, self.geri_sayim)
        elif self.kalan_sure <= 0: self.oyun_sonu_paneli()

    def kontrol_et(self):
        if not self.oyun_aktif: return
        tahmin = self.entry_tahmin.get().lower().strip()
        if tahmin == self.secilen_kelime:
            self.toplam_dogru += 1; self.genel_toplam_karakter += (len(self.secilen_kelime) + 1)
            if not self.bot_aktif: winsound.Beep(1000, 50)
        else:
            self.toplam_yanlis += 1; winsound.Beep(400, 100); self.ekran_sars(6)
        self.lbl_d_y.config(text=f"✅ {self.toplam_dogru}  ❌ {self.toplam_yanlis}"); self.yeni_kelime()

    def rekor_oku(self):
        if not os.path.exists("rekorlar.txt"): return 0, 0
        try:
            with open("rekorlar.txt", "r") as f:
                v = f.read().splitlines()
                if len(v) >= 2: return int(v[0]), int(v[1])
                return 0, 0
        except: return 0, 0

    def rekor_sifirla_sifreli(self):
        sifre = simpledialog.askstring("GÜVENLİK", "Sıfırlama şifresini girin:", show='*')
        if sifre == "780878":
            if os.path.exists("rekorlar.txt"): os.remove("rekorlar.txt")
            self.rekor_wpm = self.rekor_kelime = 0
            self.lbl_rekor_wpm.config(text="🏆 0 WPM"); self.lbl_rekor_kelime.config(text="🎯 REKOR: 0 KELİME")
            winsound.Beep(1000, 300); messagebox.showinfo("BİLGİ", "Tüm rekorlar sıfırlandı!")
        else: messagebox.showerror("HATA", "Yanlış şifre!")

    def oyun_sonu_paneli(self):
        self.oyun_aktif = self.bot_aktif = False; self.entry_tahmin.config(state="disabled")
        gecen = max(1, self.oyun_suresi - self.kalan_sure)
        wpm = int((self.genel_toplam_karakter / 5) / (gecen / 60))
        if not self.bot_mu_kullandi:
            if wpm > self.rekor_wpm or self.toplam_dogru > self.rekor_kelime:
                self.rekor_wpm = max(wpm, self.rekor_wpm); self.rekor_kelime = max(self.toplam_dogru, self.rekor_kelime)
                with open("rekorlar.txt", "w") as f: f.write(f"{self.rekor_wpm}\n{self.rekor_kelime}")
                self.lbl_rekor_wpm.config(text=f"🏆 {self.rekor_wpm} WPM"); self.lbl_rekor_kelime.config(text=f"🎯 REKOR: {self.rekor_kelime} KELİME")
        
        for w in self.result_overlay.winfo_children(): w.destroy()
        self.result_overlay.place(relx=0, rely=0, relwidth=1, relheight=1)
        tk.Label(self.result_overlay, text="SİSTEM ANALİZİ", font=("Segoe UI", 30, "bold"), bg="#050505", fg="#00E5FF").pack(pady=40)
        tk.Label(self.result_overlay, text=f"HIZ: {wpm} WPM\nSKOR: {self.toplam_dogru}", font=("Consolas", 20), bg="#050505", fg="#FFFFFF").pack()
        tk.Button(self.result_overlay, text="YENİDEN BAŞLAT", font=("Segoe UI", 18, "bold"), bg="#2ECC71", command=self.reset_game, padx=30, pady=10).pack(pady=40)

    def reset_game(self):
        self.oyun_aktif = self.bot_aktif = self.bot_mu_kullandi = False 
        self.result_overlay.place_forget(); self.entry_tahmin.config(state="normal")
        self.ilk_tus_basildi = False; self.kalan_sure = self.oyun_suresi
        self.toplam_dogru = self.toplam_yanlis = self.genel_toplam_karakter = 0
        self.lbl_d_y.config(text="✅ 0  ❌ 0"); self.lbl_sure.config(text=f"{self.oyun_suresi}")
        self.lbl_kelime_timer.config(text="READY", fg="#444"); self.lbl_wpm.config(text="0 WPM")
        self.vortex_update(0); self.yeni_kelime(); self.entry_tahmin.focus_set()

if __name__ == "__main__":
    root = tk.Tk(); game = SecovTitanGame(root); root.mainloop()