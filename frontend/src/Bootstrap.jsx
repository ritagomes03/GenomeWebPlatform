import App from './App'
import { useRuntimeErrorCapture } from './hooks/useTelemetry'

export default function Bootstrap() {
  useRuntimeErrorCapture()
  return <App />
}
