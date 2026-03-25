import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
})

export async function getStock(symbol) {
  try {
    const res = await api.get(`/stock/${encodeURIComponent(symbol)}`)
    return res.data
  } catch (err) {
    throw err.response?.data ?? err
  }
}

export async function chatCopilot(query) {
  try {
    const res = await api.post('/copilot/chat', { query })
    return res.data
  } catch (err) {
    throw err.response?.data ?? err
  }
}

export async function getAlerts() {
  try {
    const res = await api.get('/alerts')
    return res.data
  } catch (err) {
    throw err.response?.data ?? err
  }
}

export default {
  getStock,
  chatCopilot,
  getAlerts,
}
