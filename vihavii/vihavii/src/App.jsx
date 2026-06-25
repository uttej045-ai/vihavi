import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/common/ToastContext";

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
