
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var formId = script.getAttribute("data-form-id");
  if (!formId) {
    console.error("Voxorah: Missing data-form-id.");
    return;
  }

  var widgetOrigin = new URL(script.src).origin;
  var primaryColor = script.getAttribute("data-color") || "#059669";

  if (document.getElementById("voxorah-widget-root")) return;

  var root = document.createElement("div");
  root.id = "voxorah-widget-root";
  root.style.cssText =
    "position:fixed;right:20px;bottom:20px;z-index:2147483000;" +
    "font-family:Arial,Helvetica,sans-serif;";

  var launcher = document.createElement("button");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open chat");
  launcher.setAttribute("aria-expanded", "false");
  launcher.textContent = "Chat with us";
  launcher.style.cssText =
    "border:0;border-radius:999px;padding:15px 22px;" +
    "background:" + primaryColor + ";color:#fff;font-size:14px;" +
    "font-weight:600;cursor:pointer;box-shadow:0 8px 28px #0002;";

  var panel = document.createElement("div");
  panel.style.cssText =
    "display:none;position:absolute;right:0;bottom:68px;" +
    "width:min(380px,calc(100vw - 32px));" +
    "height:min(620px,calc(100dvh - 115px));" +
    "min-height:360px;background:#fff;border-radius:18px;" +
    "overflow:hidden;box-shadow:0 15px 55px #0003;" +
    "border:1px solid #e5e7eb;";

  var frame = document.createElement("iframe");
  frame.title = "Voxorah conversational form";
  frame.src =
    widgetOrigin + "/widget/" + encodeURIComponent(formId) +
    "?color=" + encodeURIComponent(primaryColor);
  frame.loading = "lazy";
  frame.style.cssText =
    "display:block;width:100%;height:100%;border:0;background:#fff;";
  frame.setAttribute("allow", "clipboard-write");

  panel.appendChild(frame);
  root.appendChild(panel);
  root.appendChild(launcher);
  document.body.appendChild(root);

  var opened = false;

  launcher.addEventListener("click", function () {
    opened = !opened;
    panel.style.display = opened ? "block" : "none";
    launcher.setAttribute("aria-expanded", String(opened));
    launcher.textContent = opened ? "Close chat" : "Chat with us";
    launcher.setAttribute(
      "aria-label",
      opened ? "Close chat" : "Open chat"
    );
  });

  window.addEventListener("message", function (event) {
    if (event.origin !== widgetOrigin) return;
    if (!event.data || event.data.type !== "voxorah:close") return;

    opened = false;
    panel.style.display = "none";
    launcher.textContent = "Chat with us";
    launcher.setAttribute("aria-expanded", "false");
  });
})();
