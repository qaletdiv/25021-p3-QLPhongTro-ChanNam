import { useEffect, useRef } from "react";
import pushApi from "../api/pushApi";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function registerAndSubscribe() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (!("Notification" in window)) return;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    if (Notification.permission === "granted") {
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        const { data } = await pushApi.getVapid();
        if (!data.publicKey) return;
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        });
      }
      if (subscription) {
        await pushApi.subscribe({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
            auth: arrayBufferToBase64(subscription.getKey("auth")),
          },
        });
      }
    }
  } catch (e) {
    // Silent: push is optional.
    console.error("Push registration failed:", e.message);
  }
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function usePushSubscription() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (typeof window === "undefined") return;
    registerAndSubscribe();
  }, []);
}

export async function requestPushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    await registerAndSubscribe();
    return true;
  }
  return false;
}

export { registerAndSubscribe };