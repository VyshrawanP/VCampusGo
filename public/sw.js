self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Mess Reminder", {
      body: data.body || "Meal in 1 hour",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png"
    })
  );
});
