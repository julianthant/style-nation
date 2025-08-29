import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Simple axios instance for public API calls (no authentication needed)
export default axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
