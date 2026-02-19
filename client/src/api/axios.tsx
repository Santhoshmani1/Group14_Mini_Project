
import axios from "axios"

const api = axios.create({
	baseURL: (import.meta as any).env?.VITE_API_URL || "http://localhost:3000",
})

export default api
