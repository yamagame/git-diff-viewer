export const sampleDiff = `diff --git a/src/index.tsx b/src/index.tsx
index 032464f..860f362 100644
--- a/src/index.tsx
+++ b/src/index.tsx
@@ -1,15 +1,22 @@
-import React from 'react';
-import ReactDOM from 'react-dom/client';
-import './index.css';
-import App from './App';
-import reportWebVitals from './reportWebVitals';
+import React from "react";
+import ReactDOM from "react-dom/client";
+import "./index.css";
+import App from "./App";
+import reportWebVitals from "./reportWebVitals";
+import { store } from "store";
+import { Provider } from "react-redux";
+import { BackgroundColorProvider } from "context/BackgroundColor";
 
 const root = ReactDOM.createRoot(
-  document.getElementById('root') as HTMLElement
+  document.getElementById("root") as HTMLElement
 );
 root.render(
   <React.StrictMode>
-    <App />
+    <Provider store={store}>
+      <BackgroundColorProvider>
+        <App />
+      </BackgroundColorProvider>
+    </Provider>
   </React.StrictMode>
 );
`;
