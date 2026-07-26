import { io } from 'socket.io-client'
import { apiUrl } from '../lib/api.js'

/**
 * One shared socket instance for the whole app. Created once at module
 * scope (not inside a component/hook) so remounts and StrictMode's
 * double-invoke never create a second connection to the same backend.
 */
export const socket = io(apiUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
})
