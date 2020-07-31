import { createStore } from '@/store/index';
import axios from 'axios'
// import applicationUserManager from "../Auth/applicationusermanager";

const store = createStore();
// 配置API接口地址
var root1 = "http://localhost:58427/api";//测试本地，用CORS跨域
var root = "/api/";//用proxy实现本地代理跨域（生产环境使用的是nginx）
// 引用axios

// 自定义判断元素类型JS
function toType(obj) {
    return {}.toString
        .call(obj)
        .match(/\s([a-zA-Z]+)/)[1]
        .toLowerCase();
}
// 参数过滤函数
function filterNull(o) {
    for (var key in o) {
        if (o[key] === null) {
            delete o[key];
        }
        if (toType(o[key]) === "string") {
            o[key] = o[key].trim();
        } else if (toType(o[key]) === "object") {
            o[key] = filterNull(o[key]);
        } else if (toType(o[key]) === "array") {
            o[key] = filterNull(o[key]);
        }
    }
    return o;
}

// http request 拦截器
var storeTemp = store;
axios.interceptors.request.use(
    config => {
        console.log(config.params)
        if (storeTemp.state.token) {
            // 判断是否存在token，如果存在的话，则每个http header都加上token
            config.headers.Authorization = "Bearer " + storeTemp.state.token;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);
// http response 拦截器
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 返回 401 清除token信息并跳转到登录页面
                    store.commit("saveToken", "");
                    window.localStorage.removeItem("USER_NAME");
                // applicationUserManager.login();
                //   router.replace({
                //   path: "/login",
                //   query: { redirect: router.currentRoute.fullPath }
                // });
            }
        }
        return Promise.reject(error.response.data); // 返回接口返回的错误信息
    }
);
/*
  接口处理函数
  这个函数每个项目都是不一样的，我现在调整的是适用于
  https://cnodejs.org/api/v1 的接口，如果是其他接口
  需要根据接口的参数进行调整。参考说明文档地址：
  https://cnodejs.org/topic/5378720ed6e2d16149fa16bd
  主要是，不同的接口的成功标识和失败提示是不一致的。
  另外，不同的项目的处理方法也是不一致的，这里出错就是简单的alert
*/

function apiAxios() {
    return axios.create({
        baseURL: root,
        // `headers` 是即将被发送的自定义请求头
        withCredentials: false
    })
}

// 返回在vue模板中的调用接口
export default {
    get: function (url, params, headers) {
        if (params) {
            params = filterNull(params);
        }
        return apiAxios().get(url, {
            data: null,
            params: params,
            headers
        });
    },
    // data: method === "POST" || method === "PUT" ? params : null,
    // params: method === "GET" || method === "DELETE" ? params : null,
    post: function (url, params, headers) {
        if (params) {
            params = filterNull(params);
        }
        return apiAxios().post(url, {
            data: params,
            parms: null,
            headers
        })
    },
    put: function (url, params, headers) {
        if (params) {
            params = filterNull(params);
        }
        return apiAxios().put(url, {
            data: params,
            parms: null,
            headers
        })
    },
    delete: function (url, params, headers) {
        if (params) {
            params = filterNull(params);
        }
        return apiAxios().delete(url, {
            data: null,
            params,
            headers
        })
    },
};