// API 回應的通用介面
// 定義所有 API 回應都會有的基本資料結構
export interface ApiResponse {
  success: boolean;      // API 請求是否成功
  message?: string;      // 可選的回應訊息
  token?: string;        // JWT 認證令牌
  expired?: string;      // 令牌過期時間
  products?: Product[];  // 可選的產品資料陣列
}

// 登入表單資料介面
// 定義登入時需要的資料欄位
export interface FormData {
  username: string;  // 使用者帳號（Email）
  password: string;  // 使用者密碼
}

// 產品資料介面
// 定義單一產品的所有屬性
export interface Product {
  id: string;           // 產品唯一識別碼
  title: string;        // 產品名稱
  origin_price: number; // 產品原價
  price: number;        // 產品售價
  is_enabled: number | boolean;  // 產品是否上架（可能是數字或布林值）
  imageUrl: string;     // 產品主圖網址
  imagesUrl?: string[]; // 可選的產品副圖網址陣列
  category: string;     // 產品分類
  content: string;      // 產品內容描述
}

// 環境變數相關型別宣告
declare module '*.css';  // 讓 TypeScript 認識 CSS 模組

// 環境變數介面
declare interface ImportMetaEnv {
  readonly VITE_API_URL: string;  // API 基礎網址
  readonly VITE_API_PATH: string; // API 路徑
} 