(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme toggle */
  var root = document.documentElement;
  var btn = document.querySelector('[data-theme-toggle]');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function label() { if (btn) btn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme'); }
  if (btn) {
    label();
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
    });
  }

  /* How it sorts: walk an example item through the five steps.
     These are illustrations of the logic, not measured results. */
  var sim = document.querySelector('[data-sim]');
  if (sim) {
    var items = {
      bottle:  { call: 'Predicted: recyclable, above threshold', bin: 'recycle' },
      can:     { call: 'Predicted: recyclable, above threshold', bin: 'recycle' },
      wrapper: { call: 'Predicted: general waste', bin: 'trash' },
      unsure:  { call: 'Predicted: recyclable, below threshold', bin: 'trash' }
    };
    var steps = sim.querySelectorAll('.flow > li');
    var bins = sim.querySelectorAll('[data-bin]');
    var readout = sim.querySelector('[data-readout]');
    var chips = sim.querySelectorAll('[data-item]');
    var timers = [];

    function reset() {
      timers.forEach(clearTimeout); timers = [];
      steps.forEach(function (s) { s.classList.remove('on'); });
      bins.forEach(function (b) { b.classList.remove('hit'); });
      sim.removeAttribute('data-done');
    }
    function run(key) {
      var item = items[key];
      reset();
      readout.textContent = 'Running inference…';
      var gap = reduce ? 0 : 420;
      steps.forEach(function (s, i) {
        timers.push(setTimeout(function () {
          s.classList.add('on');
          if (s.getAttribute('data-step') === 'model') readout.textContent = item.call;
          if (i === steps.length - 1) {
            sim.querySelector('[data-bin="' + item.bin + '"]').classList.add('hit');
            sim.setAttribute('data-done', '');
            readout.textContent = item.call + ' → ' + (item.bin === 'recycle' ? 'recycling' : 'general waste');
          }
        }, i * gap));
      });
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
        run(c.getAttribute('data-item'));
      });
    });
  }

  /* Validation accuracy chart, values copied from the training log */
  var chart = document.querySelector('[data-acc-chart]');
  if (chart) {
    var acc = [0.8787, 0.9138, 0.9218, 0.9293, 0.9391, 0.9502, 0.9516, 0.9524];
    var W = 520, H = 300, L = 44, R = 16, T = 16, B = 40;
    var lo = 0.86, hi = 0.96;
    function x(i) { return L + i * (W - L - R) / (acc.length - 1); }
    function y(v) { return T + (hi - v) * (H - T - B) / (hi - lo); }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
    for (var g = 0.86; g <= 0.9601; g += 0.02) {
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '"/>';
      s += '<text class="axis-t" x="' + (L - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + Math.round(g * 100) + '%</text>';
    }
    acc.forEach(function (v, i) {
      s += '<text class="axis-t" x="' + x(i) + '" y="' + (H - B + 20) + '" text-anchor="middle">' + (i + 1) + '</text>';
    });
    s += '<text class="axis-t" x="' + ((L + W - R) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Epoch</text>';
    s += '<polyline class="line" points="' + acc.map(function (v, i) { return x(i) + ',' + y(v); }).join(' ') + '"/>';
    acc.forEach(function (v, i) {
      s += '<circle class="dot' + (i === acc.length - 1 ? ' dot-last' : '') + '" cx="' + x(i) + '" cy="' + y(v) + '" r="4.5"><title>Epoch ' + (i + 1) + ': ' + (v * 100).toFixed(1) + '%</title></circle>';
    });
    var last = acc.length - 1;
    s += '<text class="lab" x="' + (x(last) - 8) + '" y="' + (y(acc[last]) - 12) + '" text-anchor="end">95.2%</text>';
    s += '<text class="lab" x="' + (x(0) + 10) + '" y="' + (y(acc[0]) + 4) + '">87.9%</text>';
    s += '</svg>';
    chart.innerHTML = s;
  }

  /* Load YouTube only when a video is clicked */
  document.querySelectorAll('.video[data-yt]').forEach(function (v) {
    var b = v.querySelector('.video-play');
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + v.getAttribute('data-yt') + '?autoplay=1&rel=0';
      f.title = v.getAttribute('data-title');
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      b.replaceWith(f);
      f.focus();
    });
  });
})();
