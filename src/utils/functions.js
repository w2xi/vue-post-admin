const refreshToken = () => {
	return axios.post(api.refreshToken, { token: getToken() })
				.then(res => res.data)
}

const setToken = token  => localStorage.token = token
const getToken = ()     => localStorage.token

export { refreshToken, setToken, getToken }