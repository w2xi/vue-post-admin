import Vue from "vue"
import qs from "qs"
import axios from "axios"
import api from "@/config/api"
import { refreshToken, setToken, getToken } from './functions.js'

let isRefreshingToken = false
let requests = []

const vm = new Vue()
// Add a request interceptor
axios.interceptors.request.use(config => {
	config.headers.Authorization = getToken()

	return config
});
// Add a response interceptor
axios.interceptors.response.use(response => {
	if (response.data.code === 1004) {
		const config = response.config

		if (!isRefreshingToken) {
			isRefreshingToken = true

			return refreshToken()
				.then(res => {
					setToken(res.data.token)
					requests.forEach(cb => cb())
					
					return axios(config)
				})
				.catch(err => {
					console.log("Encountering an error when refreshing token => ", err)
				})
				.finally(() => {
					isRefreshingToken = false
					requests = []
				});
		} else {
			return new Promise(resolve => {
				requests.push(() => {
					resolve(axios(config))
				})
			})
		}
	} else if (response.data.code === 10000) {

		return response;
	} else if (response.data.code = 1001) {
		vm.$toast({
				message: '没有访向权限，请联系管理员',
				duration: 8000
			}
		)
	} else if (response.data.code == 1006) {
		vm.$toast({
				message: '未录入OA管理系统，请联系管理员',
				duration: 8000
			}
		)
	} else {
		vm.$toast({
				message: response.data.msg,
				duration: 5000
			}
		)
	}

	// Any status code that lie within the range of 2xx cause this function to trigger
	// Do something with response data
}, error => {
	// Any status codes that falls outside the range of 2xx cause this function to trigger
	// Do something with response error
	return Promise.reject(error);
});

const axiosRq = async (url, data = {}, type = "GET") => {
	let result = null
	type = type.toUpperCase()

	if (type === "GET") {
		await axios
			.get(url, {
				params: data
			})
			.then(res => {
				result = res.data
			})
			.catch(err => console.log(err))
	} else if (type === "POST") {
		await axios
			.post(url, qs.stringify(data))
			.then(res => {
				result = res.data
			})
			.catch(err => console.log(err))
	}

	return result
}

export { axiosRq }
