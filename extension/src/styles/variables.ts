const variableOverrides = new Map<string, string>();

export function setVariable(name: string, value: string): void {
  variableOverrides.set(name, value);
  document.documentElement.style.setProperty(name, value, 'important');
}

export function removeVariable(name: string): void {
  variableOverrides.delete(name);
  document.documentElement.style.removeProperty(name);
}

export function setVariables(vars: Record<string, string>): void {
  for (const [name, value] of Object.entries(vars)) {
    setVariable(name, value);
  }
}

export function clearVariables(): void {
  for (const name of variableOverrides.keys()) {
    document.documentElement.style.removeProperty(name);
  }
  variableOverrides.clear();
}

export function getActiveOverrides(): Map<string, string> {
  return new Map(variableOverrides);
}

export function getComputedVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
