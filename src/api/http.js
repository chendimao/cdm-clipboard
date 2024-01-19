import axios from "axios";
import qs from "qs";

const serverConfig = {
  baseURL: "https://smallpig.site", // 请求基础地址,可根据环境自定义
  useTokenAuthorization: false, // 是否开启 token 认证
};

let myService;

// 创建 axios 请求实例
export class serviceAxios {
  constructor(baseUrl = '/', useTokenAuthorization = false) {
    myService =  axios.create({
      baseURL: baseUrl, // 基础请求地址
      timeout: 1000000, // 请求超时设置
      withCredentials: false, // 跨域请求是否需要携带 cookie
      useTokenAuthorization: useTokenAuthorization
    })


    // 创建请求拦截
    myService.interceptors.request.use(
      (config) => {
        // 如果开启 token 认证
        if (serverConfig.useTokenAuthorization) {
          config.headers["Authorization"] = localStorage.getItem("token"); // 请求头携带 token
        }
        // 设置请求头
        if(!config.headers["Content-Type"]) { // 如果没有设置请求头
          if(config.method === 'post') {
            config.headers["Content-Type"] = "application/x-www-form-urlencoded"; // post 请求
            config.data = qs.stringify(config.data); // 序列化,比如表单数据
          } else {
            config.headers["Content-Type"] = "application/json"; // 默认类型
          }
        }
        //console.log("request config", config);
        return config;
      },
      (error) => {
        Promise.reject(error);
      }
    );


// 创建响应拦截
    myService.interceptors.response.use(
      (res) => {
        //console.log(res, 44);
        let data = res.data;
        // 处理自己的业务逻辑，比如判断 token 是否过期等等
        // 代码块
        return data;
      },
      (error) => {
        let message = "";
        if (error && error.response) {
          switch (error.response.status) {
            case 302:
              message = "接口重定向了！";
              break;
            case 400:
              message = "参数不正确！";
              break;
            case 401:
              message = "您未登录，或者登录已经超时，请先登录！";
              break;
            case 403:
              message = "您没有权限操作！";
              break;
            case 404:
              message = `请求地址出错: ${error.response.config.url}`;
              break;
            case 408:
              message = "请求超时！";
              break;
            case 409:
              message = "系统已存在相同数据！";
              break;
            case 500:
              message = "服务器内部错误！";
              break;
            case 501:
              message = "服务未实现！";
              break;
            case 502:
              message = "网关错误！";
              break;
            case 503:
              message = "服务不可用！";
              break;
            case 504:
              message = "服务暂时无法访问，请稍后再试！";
              break;
            case 505:
              message = "HTTP 版本不受支持！";
              break;
            default:
              message = "异常问题，请联系管理员！";
              break;
          }
        }
        return Promise.reject({code: error.response.status,message});
      }
    );

  }

  /**
   * methods: 请求
   * @param url 请求地址
   * @param conf 请求参数
   */
  get(url, conf){
    const config = {
      method: 'get',
      url:url,
      ...conf
    }
    return myService(config)
  };
  post(url, conf){
    const config = {
      method: 'post',
      url:url,
      ...conf
    }

    return myService(config)
  };
  put(url, conf){
    const config = {
      method: 'put',
      url:url,
      ...conf
    }

    return myService(config)
  };
  delete(url, conf){
    const config = {
      method: 'delete',
      url:url,
      ...conf
    }

    return myService(config)
  };
  move(url, conf){
    const config = {
      method: 'move',
      url:url,
      ...conf
    }
    return myService(config)
  };
  propfind(url, conf){
    const config = {
      method: 'propfind',
      url:url,
      ...conf
    }

    return myService(config)
  };
  mkcol(url, conf){
    const config = {
      method: 'mkcol',
      url:url,
      ...conf
    }

    return myService(config)
  };
  copy(url, conf){
    const config = {
      method: 'copy',
      url:url,
      ...conf
    }
    return myService(config)
  };
  all(list) {
    console.log(myService, 185);
   return myService.all(list)
  }
}






