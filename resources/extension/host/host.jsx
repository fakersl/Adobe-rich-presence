// ExtendScript (ES3). Sem JSON nativo: monta o JSON na mão.
var ADOBE_RPC_TOOLS = {
  moveTool: 'Mover', marqueeRectTool: 'Seleção', marqueeEllipTool: 'Seleção', lassoTool: 'Laço',
  polySelTool: 'Laço', magicLassoTool: 'Laço', quickSelectTool: 'Seleção rápida', magicWandTool: 'Varinha',
  cropTool: 'Cortar', eyedropperTool: 'Conta-gotas', spotHealingBrushTool: 'Corretivo',
  magicStampTool: 'Carimbo', patchSelection: 'Remendo', redEyeTool: 'Olhos vermelhos',
  paintbrushTool: 'Pincel', brushTool: 'Pincel', pencilTool: 'Lápis', cloneStampTool: 'Carimbo',
  historyBrushTool: 'Pincel de histórico', eraserTool: 'Borracha', backgroundEraserTool: 'Borracha',
  magicEraserTool: 'Borracha', gradientTool: 'Gradiente', bucketTool: 'Balde', paintbucketTool: 'Balde',
  blurTool: 'Desfoque', sharpenTool: 'Nitidez', smudgeTool: 'Borrão', dodgeTool: 'Subexposição',
  burnInTool: 'Superexposição', penTool: 'Caneta', freeformPenTool: 'Caneta',
  typeCreateOrEditTool: 'Texto', typeVerticalCreateOrEditTool: 'Texto',
  pathComponentSelectTool: 'Seleção de caminho', directSelectTool: 'Seleção direta',
  rectangleTool: 'Retângulo', roundedRectangleTool: 'Retângulo', ellipseTool: 'Elipse',
  polygonTool: 'Polígono', lineTool: 'Linha', customShapeTool: 'Forma', handTool: 'Mão',
  zoomTool: 'Zoom', rotateTool: 'Girar', artboardTool: 'Prancheta', sliceTool: 'Fatia'
}

function adobeRpcEsc(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
}

function adobeRpcStr(v) {
  return v ? '"' + adobeRpcEsc(v) + '"' : 'null'
}

function adobeRpcOut(host, project, activity) {
  return '{"host":"' + host + '","project":' + adobeRpcStr(project) + ',"activity":' + adobeRpcStr(activity) + '}'
}

function adobeRpcTool(t) {
  if (!t) return ''
  t = String(t)
  if (ADOBE_RPC_TOOLS[t]) return ADOBE_RPC_TOOLS[t]
  return t.replace(/Tool$/, '')
}

function adobeRpcPs() {
  if (app.documents.length === 0) return adobeRpcOut('photoshop', null, 'Na tela inicial')
  var d = app.activeDocument
  var layer = ''
  var tool = ''
  try { layer = d.activeLayer.name } catch (e1) {}
  try { tool = adobeRpcTool(app.currentTool) } catch (e2) {}
  var a = ''
  if (layer) a = 'Editando "' + layer + '"'
  if (tool) a = a ? a + ' · ' + tool : 'Ferramenta: ' + tool
  return adobeRpcOut('photoshop', d.name, a)
}

function adobeRpcAi() {
  if (app.documents.length === 0) return adobeRpcOut('illustrator', null, 'Na tela inicial')
  var d = app.activeDocument
  var parts = []
  try { parts.push('Prancheta ' + (d.artboards.getActiveArtboardIndex() + 1) + '/' + d.artboards.length) } catch (e1) {}
  try {
    var n = app.selection.length
    if (n > 0) parts.push(n + (n === 1 ? ' objeto selecionado' : ' objetos selecionados'))
  } catch (e2) {}
  return adobeRpcOut('illustrator', d.name, parts.join(' · '))
}

function adobeRpcPr() {
  var p = app.project
  if (!p) return adobeRpcOut('premiere', null, 'Na tela inicial')
  var a = ''
  try { if (p.activeSequence) a = 'Sequência "' + p.activeSequence.name + '"' } catch (e) {}
  return adobeRpcOut('premiere', p.name, a || 'No painel de projeto')
}

function adobeRpcAe() {
  var p = app.project
  var name = 'Sem título'
  try { if (p.file) name = decodeURI(p.file.name) } catch (e1) {}
  var a = 'No painel de projeto'
  try {
    var it = p.activeItem
    if (it && it instanceof CompItem) {
      a = 'Comp "' + it.name + '" · ' + it.numLayers + (it.numLayers === 1 ? ' camada' : ' camadas')
    }
  } catch (e2) {}
  return adobeRpcOut('aftereffects', name, a)
}

function adobeRpcId() {
  if (app.documents.length === 0) return adobeRpcOut('indesign', null, 'Na tela inicial')
  var d = app.activeDocument
  var a = ''
  try { a = 'Página ' + app.activeWindow.activePage.name + ' de ' + d.pages.length } catch (e) {}
  return adobeRpcOut('indesign', d.name, a)
}

function adobeRpcSnapshot() {
  try {
    var n = String(BridgeTalk.appName).toLowerCase()
    if (n.indexOf('photoshop') > -1) return adobeRpcPs()
    if (n.indexOf('illustrator') > -1) return adobeRpcAi()
    if (n.indexOf('premiere') > -1) return adobeRpcPr()
    if (n.indexOf('aftereffects') > -1) return adobeRpcAe()
    if (n.indexOf('indesign') > -1) return adobeRpcId()
  } catch (e) {}
  return adobeRpcOut('unknown', null, null)
}
