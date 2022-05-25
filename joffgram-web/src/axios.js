import axios from 'axios'
import Cookies from 'universal-cookie'

const cookies = new Cookies()
const csrfToken = cookies.get('csrftoken')

export const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 5000,
    headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json'
    }
});