(function () {
  const map = window.ASSETS || {};
  document.querySelectorAll("[data-asset]").forEach((el) => {
    const src = map[el.dataset.asset];
    if (!src) return;
    if (el.tagName === "IMG") el.src = src;
    else el.style.backgroundImage = 'url("' + src + '")';
  });
  const hero = document.querySelector(".hero-fallback");
  if (hero && map.front) hero.style.backgroundImage = 'url("' + map.front + '")';
  const studio = document.querySelector(".studio");
  if (studio && map.front) studio.style.backgroundImage = 'url("' + map.front + '")';
})();
