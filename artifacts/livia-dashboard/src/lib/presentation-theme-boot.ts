/** Presets that render dark — keep in sync with `PRESENTATION_COLOR_MODE` in experience-theme.ts */
export const DARK_PRESENTATION_PRESETS = new Set([
  "platform-default",
  "noir-dusk",
  "premium-dark",
  "evening-ledger",
  "barber-bold",
]);

/** Blocking boot snippet for index.html — prevents white flash in preview iframes before React. */
export function presentationThemeBootScript(): string {
  const darkList = [...DARK_PRESENTATION_PRESETS].map((p) => JSON.stringify(p)).join(",");
  return `(function(){try{var p=new URLSearchParams(location.search);var preset=p.get("preset");var preview=p.get("preview")==="1"||p.get("appearanceEmbed")==="1";if(!preview)return;if(!preset)preset="platform-default";var dark=new Set([${darkList}]);var el=document.documentElement;el.dataset.presentation=preset;var isDark=dark.has(preset);el.style.colorScheme=isDark?"dark":"light";el.style.backgroundColor=isDark?"hsl(240 10% 4%)":"hsl(0 0% 99%)";document.body&&(document.body.style.backgroundColor=el.style.backgroundColor);if(isDark)el.classList.add("dark");else el.classList.remove("dark");}catch(e){}})();`;
}
