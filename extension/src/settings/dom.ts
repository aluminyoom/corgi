export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  ...children: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "className") element.className = value;
      else element.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === "string")
      element.appendChild(document.createTextNode(child));
    else element.appendChild(child);
  }
  return element;
}

export function kagiToggle(
  checked: boolean,
  onChange: (value: boolean) => void,
): HTMLElement {
  const input = document.createElement("input");
  input.type = "checkbox";
  if (checked) input.checked = true;

  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.value = "false";

  const bar = el("div", { className: "k_ui_toggle_switch_bar" });
  const toggle = el("label", {
    className: "_0_k_ui_toggle_switch k_ui_toggle_switch",
  });
  toggle.appendChild(input);
  toggle.appendChild(hidden);
  toggle.appendChild(bar);

  input.addEventListener("change", () => onChange(input.checked));
  return toggle;
}

export function settingsRow(
  label: string,
  description: string,
  control: HTMLElement,
  gearBtn?: HTMLElement | null,
): HTMLElement {
  const left = el(
    "div",
    { className: "c-left lg:min-w-xs pr-24 m-0 fs-base" },
    el("label", {}, label),
    el("div", { className: "description" }, description),
  );

  const right = el("div", {
    className: "c-right flex justify-end align-center flex-fluid pt-8 xl:pt-0",
  });
  if (gearBtn) right.appendChild(gearBtn);
  right.appendChild(control);

  const row = el("div", { className: "settings-row flex flex-wrap" });
  row.appendChild(left);
  row.appendChild(right);

  const box = el("div", { className: "settings-row-box box pb-16 md:pb-9" });
  box.appendChild(row);
  return box;
}

export function sectionHeading(text: string, subtitle?: string): HTMLElement {
  const box = el("div", { className: "settings-row-box box pb-16 md:pb-9" });
  box.style.borderBottom = "none";
  const heading = el("h2", { className: "heading-3 mt-8" }, text);
  box.appendChild(heading);
  if (subtitle) {
    const sub = el("span", {}, subtitle);
    sub.style.fontSize = "13px";
    sub.style.color = "var(--color-primary_light, #999)";
    sub.style.display = "block";
    sub.style.marginTop = "2px";
    box.appendChild(sub);
  }
  return box;
}
