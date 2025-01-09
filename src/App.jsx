import { useState, useEffect } from "react";
import axios from "axios";
import "./assets/style.css";

// API 基礎網址設定
const API_BASE = "https://ec-course-api.hexschool.io/v2";
// API 路徑，需要替換成自己的路徑
const API_PATH = "orias";

function App() {
  // 表單資料狀態，用於存儲使用者名稱和密碼
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // 管理登入狀態的 state，true 表示已登入，false 表示未登入
  const [isAuth, setisAuth] = useState(false);

  // 儲存產品列表的 state，初始值為空陣列
  const [products, setProducts] = useState([]);

  // 儲存當前選中產品詳情的 state，初始值為 null
  const [tempProduct, setTempProduct] = useState(null);

  // 檢查使用者登入狀態的函式
  // 從 Cookie 中取得 token 並驗證其有效性
  async function checkLogin() {
    try {
      // 1. 從 Cookie 中取得 token
      // split("; ") 將 Cookie 字串以分號和空格分割成陣列
      // find() 尋找以 "hexToken=" 開頭的 Cookie
      // split("=")[1] 取得 token 值
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];

      // 2. 設定 axios 的請求標頭
      // 將 token 加入到所有 axios 請求的 Authorization 標頭中
      axios.defaults.headers.common.Authorization = token;

      // 3. 發送驗證請求
      // 向後端 API 發送 POST 請求來驗證 token 是否有效
      const res = await axios.post(`${API_BASE}/api/user/check`);
      if (res.data.success) {
        alert("目前已登入狀態");
      }
    } catch (error) {
      // 4. 錯誤處理
      // 如果驗證失敗，將錯誤輸出到控制台
      alert("目前未登入");
      console.error(error);
    }
  }

  // 取得產品列表的非同步函式
  const getData = async () => {
    try {
      // 向 API 發送請求獲取產品資料
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      // 更新產品列表狀態
      setProducts(response.data.products);
    } catch (err) {
      console.error(err.response.data.message);
    }
  };

  // 處理表單輸入變更的函式
  // 當使用者在輸入框中輸入時觸發
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // 處理登入表單提交的非同步函式
  const handleSubmit = async (e) => {
    // 防止表單預設提交行為
    e.preventDefault();

    try {
      // 向後端發送登入請求
      const response = await axios.post(`${API_BASE}/admin/signin`, {
        username: formData.username,
        password: formData.password,
      });

      // 解構出 token 和過期時間
      const { token, expired } = response.data;
      // 將 token 存入 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;

      // 設定 axios 的預設授權標頭
      axios.defaults.headers.common.Authorization = `${token}`;

      // 登入成功後取得產品資料
      getData();
      // 更新登入狀態
      setisAuth(true);
    } catch (error) {
      alert("登入失敗: " + error.response.data.message);
    }
  };

  // 使用 useEffect 在元件載入時檢查登入狀態
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 從 Cookie 中取得 token
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("hexToken="))
          ?.split("=")[1];
        
        // 如果沒有 token，設定為未登入狀態
        if (!token) {
          setisAuth(false);
          return;
        }

        // 設定 axios 預設標頭
        axios.defaults.headers.common.Authorization = token;
        // 驗證 token 是否有效
        const res = await axios.post(`${API_BASE}/api/user/check`);
        
        // 如果驗證成功，設定登入狀態並取得產品資料
        if (res.data.success) {
          setisAuth(true);
          getData();
        }
      } catch (error) {
        console.error('登入驗證失敗:', error);
        setisAuth(false);
      }
    };

    // 執行登入狀態檢查
    checkLoginStatus();
  }, []); // 空依賴陣列表示只在元件首次載入時執行

  // 渲染 UI
  return (
    <>
      {/* 使用條件渲染：已登入顯示產品列表，未登入顯示登入表單 */}
      {isAuth ? (
        // 已登入狀態的 UI
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <button
                className="btn btn-danger mb-5"
                type="button"
                id="check"
                onClick={checkLogin}
              >
                確認是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.category}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images"
                          alt="副圖"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // 未登入狀態的 UI：登入表單
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
