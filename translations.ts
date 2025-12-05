
import { Language } from './types';

export const TRANSLATIONS = {
  id: {
    greeting: "Halo, ada yang bisa saya bantu?",
    placeholderDefault: "Ketik pesan ke GenzAI...",
    placeholderImage: "Deskripsikan gambar yang ingin dibuat...",
    fileAttached: "File terlampir",
    sidebar: {
      newChat: "Obrolan Baru",
      recent: "Terkini",
      noHistory: "Belum ada riwayat chat.\nMulai percakapan baru!",
      settings: "Pengaturan",
      help: "Bantuan & FAQ",
      deleteConfirm: "Hapus Chat?"
    },
    settings: {
      title: "Pengaturan",
      language: "Bahasa",
      preferences: "Preferensi",
      darkMode: "Mode Gelap",
      darkModeDesc: "Ubah tampilan aplikasi",
      stream: "Streaming Cepat",
      streamDesc: "Tampilkan teks saat sedang diketik",
      storage: "Data & Penyimpanan",
      clearHistory: "Hapus Semua Riwayat",
      clearDesc: "Hapus semua chat secara permanen",
      confirmDelete: "Yakin Hapus?",
      footer: "GenzAI v2.5.0 • Ditenagai oleh Google Gemini & Hugging Face"
    },
    chat: {
      thinkingHeader: "Proses Berpikir",
      analysis: "Analisis Stream",
      sources: "Sumber Ditemukan",
      thinkingStatus: [
        "Sedang berpikir...", "Menganalisis permintaan...", "Menghubungkan konteks...", 
        "Memproses data...", "Memahami maksud...", "Merumuskan logika..."
      ],
      searchingStatus: [
        "Mencari di Google...", "Mengumpulkan informasi...", "Memverifikasi fakta...", 
        "Menjelajahi web...", "Mengakses data real-time...", "Mengekstrak detail..."
      ],
      generatingImage: [
        "Creating masterpiece...", "Mixing colors...", "Sketching outlines...", 
        "Applying textures...", "Rendering lighting...", "Adding details..."
      ],
      copy: "Salin",
      share: "Bagikan"
    },
    modelSelector: {
      title: "Pilih Model"
    }
  },
  en: {
    greeting: "Hello, how can I help you?",
    placeholderDefault: "Message GenzAI...",
    placeholderImage: "Describe the image you want to create...",
    fileAttached: "File attached",
    sidebar: {
      newChat: "New Chat",
      recent: "Recent",
      noHistory: "No chat history yet.\nStart a conversation!",
      settings: "Settings",
      help: "Help & FAQ",
      deleteConfirm: "Delete Chat?"
    },
    settings: {
      title: "Settings",
      language: "Language",
      preferences: "Preferences",
      darkMode: "Dark Mode",
      darkModeDesc: "Switch appearance",
      stream: "Fast Streaming",
      streamDesc: "Show text as it generates",
      storage: "Data & Storage",
      clearHistory: "Clear All History",
      clearDesc: "Delete all chats permanently",
      confirmDelete: "Are you sure?",
      footer: "GenzAI v2.5.0 • Powered by Google Gemini & Hugging Face"
    },
    chat: {
      thinkingHeader: "Thinking Process",
      analysis: "Analysis Stream",
      sources: "Sources Found",
      thinkingStatus: [
        "Deep reasoning...", "Analyzing request...", "Connecting nodes...", 
        "Processing context...", "Understanding intent...", "Formulating logic..."
      ],
      searchingStatus: [
        "Searching Google...", "Gathering information...", "Verifying facts...", 
        "Browsing the web...", "Accessing real-time data...", "Looking for sources..."
      ],
      generatingImage: [
        "Creating masterpiece...", "Mixing colors...", "Sketching outlines...", 
        "Applying textures...", "Rendering lighting...", "Adding details..."
      ],
      copy: "Copy",
      share: "Share"
    },
    modelSelector: {
      title: "Select Model"
    }
  },
  jp: {
    greeting: "こんにちは、どうなさいましたか？",
    placeholderDefault: "GenzAIにメッセージを送る...",
    placeholderImage: "作成したい画像を説明してください...",
    fileAttached: "ファイルが添付されました",
    sidebar: {
      newChat: "新しいチャット",
      recent: "最近",
      noHistory: "チャット履歴はまだありません。\n会話を始めましょう！",
      settings: "設定",
      help: "ヘルプ & FAQ",
      deleteConfirm: "削除しますか？"
    },
    settings: {
      title: "設定",
      language: "言語",
      preferences: "設定",
      darkMode: "ダークモード",
      darkModeDesc: "外観を切り替える",
      stream: "高速ストリーミング",
      streamDesc: "生成中にテキストを表示",
      storage: "データとストレージ",
      clearHistory: "履歴をすべて消去",
      clearDesc: "すべてのチャットを完全に削除",
      confirmDelete: "本当に削除しますか？",
      footer: "GenzAI v2.5.0 • Google Gemini & Hugging Face 搭載"
    },
    chat: {
      thinkingHeader: "思考プロセス",
      analysis: "分析ストリーム",
      sources: "見つかったソース",
      thinkingStatus: [
        "深く考えています...", "リクエストを分析中...", "コンテキストを処理中...", 
        "意図を理解中...", "論理を構築中...", "データを確認中..."
      ],
      searchingStatus: [
        "Googleで検索中...", "情報を収集中...", "事実を確認中...", 
        "ウェブを閲覧中...", "リアルタイムデータにアクセス中...", "ソースを探しています..."
      ],
      generatingImage: [
        "傑作を作成中...", "色を混ぜています...", "アウトラインをスケッチ中...", 
        "テクスチャを適用中...", "ライティングをレンダリング中...", "詳細を追加中..."
      ],
      copy: "コピー",
      share: "共有"
    },
    modelSelector: {
      title: "モデルを選択"
    }
  }
};
