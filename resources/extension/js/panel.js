(function () {
  var cs = window.__adobe_cep__
  var cfg = null
  var INTERVAL = 2000
  var HEALTH_INTERVAL = 5000

  var elDot = document.getElementById('dot')
  var elStatus = document.getElementById('status')
  var elProject = document.getElementById('project')
  var elActivity = document.getElementById('activity')
  var panelControls = document.getElementById('panelControls')
  var panelDown = document.getElementById('panelDown')

  function ui(ok, text, data) {
    elDot.className = 'dot' + (ok ? ' ok' : ok === false ? '' : ' warn')
    elStatus.textContent = text
    elProject.textContent = (data && data.project) || '—'
    elActivity.textContent = (data && data.activity) || '—'
  }

  function xhr(method, url, body, cb) {
    var x = new XMLHttpRequest()
    x.open(method, url)
    x.timeout = 2500
    x.onload = function () { cb(null, x.responseText, x.status) }
    x.onerror = function () { cb(new Error('erro')) }
    x.ontimeout = function () { cb(new Error('timeout')) }
    if (method === 'POST') x.setRequestHeader('Content-Type', 'text/plain')
    x.send(body || null)
  }

  function loadConfig(cb) {
    xhr('GET', 'config.json', null, function (err, text) {
      if (!err) {
        try { cfg = JSON.parse(text) } catch (e) { cfg = null }
      }
      cb()
    })
  }

  function apiUrl(path) {
    return 'http://127.0.0.1:' + cfg.port + path + '?token=' + encodeURIComponent(cfg.token)
  }

  function ensureHost(cb) {
    cs.evalScript('typeof adobeRpcSnapshot', function (r) {
      if (r === 'function') return cb()
      xhr('GET', 'host/host.jsx', null, function (err, text) {
        if (err) return cb()
        cs.evalScript(text, function () { cb() })
      })
    })
  }

  // ---------- Health check ----------
  function checkHealth() {
    if (!cfg) return
    xhr('GET', apiUrl('/health'), null, function (err) {
      if (err) {
        panelControls.className = 'hidden'
        panelDown.className = ''
        ui(false, 'Adobe RPC fechado')
      } else {
        panelDown.className = 'hidden'
        panelControls.className = ''
        loadRemoteConfig()
      }
    })
  }

  // ---------- Sync de config ----------
  function loadRemoteConfig() {
    xhr('GET', apiUrl('/config'), null, function (err, text) {
      if (err) return
      var s
      try { s = JSON.parse(text) } catch (e) { return }
      bind('swEnabled', !!s.enabled)
      bind('swPrivate', !!s.privateMode)
      var selTimer = document.getElementById('selTimer')
      if (selTimer) selTimer.value = s.timerMode || 'app'
      var selTitle = document.getElementById('selTitle')
      if (selTitle) selTitle.value = s.titleMode || 'project'
      var selActivity = document.getElementById('selActivity')
      if (selActivity) selActivity.value = s.activityMode || 'dynamic'
    })
  }

  function bind(id, on) {
    var el = document.getElementById(id)
    if (!el) return
    el.className = 'switch' + (on ? ' on' : '')
  }

  function saveConfig(patch) {
    xhr('POST', apiUrl('/config'), JSON.stringify(patch), function () {
      loadRemoteConfig()
    })
  }

  document.querySelectorAll('.switch').forEach(function (el) {
    el.addEventListener('click', function () {
      var key = el.getAttribute('data-key')
      var next = el.className.indexOf('on') === -1
      el.className = 'switch' + (next ? ' on' : '')
      var patch = {}
      patch[key] = next
      saveConfig(patch)
    })
  })

  var selTimer = document.getElementById('selTimer')
  if (selTimer) selTimer.addEventListener('change', function () { saveConfig({ timerMode: selTimer.value }) })
  var selTitle = document.getElementById('selTitle')
  if (selTitle) selTitle.addEventListener('change', function () { saveConfig({ titleMode: selTitle.value }) })
  var selActivity = document.getElementById('selActivity')
  if (selActivity) selActivity.addEventListener('change', function () { saveConfig({ activityMode: selActivity.value }) })

  var btnReinstall = document.getElementById('btnReinstall')
  if (btnReinstall) btnReinstall.addEventListener('click', function () {
    xhr('POST', apiUrl('/ext-install'), '{}', function (err) {
      if (err) return
      ui(true, 'Reinstalação solicitada')
    })
  })

  // ---------- Snapshot ----------
  function tick() {
    if (!cfg) return loadConfig(function () { if (!cfg) ui(false, 'config.json ausente') })
    cs.evalScript('adobeRpcSnapshot()', function (res) {
      var data
      try { data = JSON.parse(res) } catch (e) { return ui(false, 'Aguardando o app Adobe') }
      if (!data || data.host === 'unknown') return ui(false, 'App não suportado')
      data.token = cfg.token
      xhr('POST', 'http://127.0.0.1:' + cfg.port + '/ext', JSON.stringify(data), function (err, _t, status) {
        if (err) return ui(false, 'Adobe RPC fechado', data)
        if (status === 401) { cfg = null; return ui(false, 'Token inválido: reinstale', data) }
        ui(true, 'Conectado', data)
      })
    })
  }

  loadConfig(function () {
    ensureHost(function () {
      tick()
      setInterval(tick, INTERVAL)
      checkHealth()
      setInterval(checkHealth, HEALTH_INTERVAL)
    })
  })
})()