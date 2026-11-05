const LAYOUT_URL = '/assets/layout.json'

const ROLE_LABELS = {
  engineering: 'Engineering',
  finance: 'Finance',
  operations: 'Operations',
  sales: 'Sales',
  product: 'Product',
  design: 'Design',
  'people-ops': 'People Ops',
  legal: 'Legal',
  executives: 'Executives',
  crew: 'Crew',
  marketing: 'Marketing',
  'business-development': 'Business Dev',
}

// Sample gallery pool; three are picked at random on each load.
const EXAMPLE_POOL = [
  { role: 'design', variant: 'v2' },
  { role: 'finance', variant: 'v1' },
  { role: 'finance', variant: 'v2' },
  { role: 'legal', variant: 'v1' },
  { role: 'product', variant: 'v3' },
  { role: 'sales', variant: 'v2' },
]

const POSE_LABELS = {
  welcome: 'Welcome',
  celebrate: 'Celebrate',
  'climb-higher': 'Climb Higher',
  'carry-parcel': 'Carry Parcel',
}

const state = { role: null, pose: null, mirror: false, showPanel: true, theme: 'dark' }

function $(id) {
  return document.getElementById(id)
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

async function compositeBanner(layout, role, variation, pose, mirror, showPanel, theme) {
  const roleDef = layout.roles[role]
  const placement = layout.mascot_poses[pose].banner_placement
  const light = theme === 'light'

  const canvas = document.createElement('canvas')
  canvas.width = layout.canvas.width
  canvas.height = layout.canvas.height
  const ctx = canvas.getContext('2d')

  const bgFile = light && layout.background.light ? layout.background.light : layout.background.file
  const bg = await loadImage(`/assets/${bgFile}`)
  ctx.drawImage(bg, 0, 0)

  if (showPanel) {
    const varDef = roleDef.panel_variations[variation]
    const panelFile = light && varDef.file_light ? varDef.file_light : varDef.file
    const panel = await loadImage(`/assets/${panelFile}`)
    ctx.drawImage(panel, varDef.place_at.x, varDef.place_at.y)
  }

  const mascotSrc = `/assets/mascot/${pose}/koko-${pose}-md${mirror ? '-mirror' : ''}.png`
  const mascot = await loadImage(mascotSrc)
  ctx.save()
  if (light) {
    ctx.shadowColor = 'rgba(13, 27, 42, 0.18)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetY = 10
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 6
  }
  ctx.drawImage(mascot, placement.left, placement.top)
  ctx.restore()

  return canvas
}

function download(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

function chipClass(active) {
  return 'chip' + (active ? ' chip-active' : '')
}

// Role chips are static markup (avoids a layout shift); bind their handlers here.
function wireRoleChips(layout) {
  for (const btn of $('role-list').querySelectorAll('button[data-role]')) {
    const role = btn.dataset.role
    if (role && layout.roles[role]) {
      btn.addEventListener('click', () => selectRole(layout, role))
    }
  }
}

function selectRole(layout, role) {
  state.role = role
  state.pose = layout.roles[role].mascot.pose
  state.mirror = false

  for (const btn of $('role-list').querySelectorAll('button[data-role]')) {
    const active = btn.dataset.role === role
    btn.className = chipClass(active)
    btn.setAttribute('aria-pressed', String(active))
  }

  $('result-role').textContent = ROLE_LABELS[role] ?? role
  setMascotControlsLocked(false)

  syncPoseChips(layout)
  syncMirror()
  prefetchRoleAssets(layout, role)
  renderBanners(layout)
}

function setMascotControlsLocked(locked) {
  const el = $('mascot-controls')
  el.classList.toggle('pointer-events-none', locked)
  for (const btn of $('pose-list').querySelectorAll('button')) btn.disabled = locked
  $('mirror-toggle').disabled = locked
  $('panel-toggle').disabled = locked
  $('theme-toggle').disabled = locked
  $('mascot-lock-hint').classList.toggle('hidden', !locked)
}

// Warm the browser cache while the user reads, so the first Generate is instant.
function prefetchRoleAssets(layout, role) {
  const roleDef = layout.roles[role]
  const pose = state.pose
  const urls = [
    `/assets/${layout.background.file}`,
    ...Object.values(roleDef.panel_variations).map((v) => `/assets/${v.file}`),
    `/assets/mascot/${pose}/koko-${pose}-md.png`,
  ]
  for (const url of urls) new Image().src = url
}

function buildPoseChips(layout) {
  const list = $('pose-list')
  for (const pose of Object.keys(layout.mascot_poses)) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.dataset.pose = pose
    btn.textContent = POSE_LABELS[pose] ?? pose
    btn.className = chipClass(false)
    btn.disabled = true
    btn.setAttribute('aria-pressed', 'false')
    btn.addEventListener('click', () => {
      state.pose = pose
      syncPoseChips(layout)
      renderBanners(layout)
    })
    list.appendChild(btn)
  }
}

function syncPoseChips(layout) {
  for (const btn of $('pose-list').children) {
    const active = btn.dataset.pose === state.pose
    btn.className = chipClass(active)
    btn.setAttribute('aria-pressed', String(active))
  }
}

function syncMirror() {
  const on = state.mirror
  const track = $('mirror-track')
  const knob = $('mirror-knob')
  $('mirror-toggle').setAttribute('aria-checked', String(on))
  track.classList.toggle('bg-teal', on)
  track.classList.toggle('bg-navy/15', !on)
  knob.classList.toggle('translate-x-4', on)
  knob.classList.toggle('translate-x-0.5', !on)
}

function syncPanel() {
  const on = state.showPanel
  const track = $('panel-track')
  const knob = $('panel-knob')
  $('panel-toggle').setAttribute('aria-checked', String(on))
  track.classList.toggle('bg-teal', on)
  track.classList.toggle('bg-navy/15', !on)
  knob.classList.toggle('translate-x-4', on)
  knob.classList.toggle('translate-x-0.5', !on)
}

function syncTheme() {
  const on = state.theme === 'light'
  const track = $('theme-track')
  const knob = $('theme-knob')
  $('theme-toggle').setAttribute('aria-checked', String(on))
  track.classList.toggle('bg-teal', on)
  track.classList.toggle('bg-navy/15', !on)
  knob.classList.toggle('translate-x-4', on)
  knob.classList.toggle('translate-x-0.5', !on)
}

function buildThemeToggle(layout) {
  $('theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light'
    syncTheme()
    renderBanners(layout)
  })
}

function buildPanelToggle(layout) {
  $('panel-toggle').addEventListener('click', () => {
    state.showPanel = !state.showPanel
    syncPanel()
    renderBanners(layout)
  })
}

function buildMirrorToggle(layout) {
  $('mirror-toggle').addEventListener('click', () => {
    state.mirror = !state.mirror
    syncMirror()
    renderBanners(layout)
  })
}

function pickRandomExamples(count) {
  const pool = [...EXAMPLE_POOL]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

function fillSamples(layout) {
  const figures = [...document.querySelectorAll('#samples figure')]
  const picks = pickRandomExamples(figures.length)
  figures.forEach((fig, index) => {
    const pick = picks[index]
    if (!pick) return
    const label = ROLE_LABELS[pick.role] ?? pick.role
    fig.dataset.role = pick.role
    fig.dataset.variant = pick.variant
    const img = fig.querySelector('img')
    img.src = `/assets/examples/webp/recompose-${pick.role}-${pick.variant}.webp`
    img.alt = `${label} sample banner`
    fig.querySelector('[data-sample-role]').textContent = label
    fig.querySelector('[data-sample-desc]').textContent =
      layout.roles[pick.role]?.panel_variations[pick.variant]?.description ?? ''
  })
}

async function renderBanners(layout) {
  const role = state.role
  const pose = state.pose
  const mirror = state.mirror
  const showPanel = state.showPanel
  const theme = state.theme
  if (!role) return

  const list = $('banner-list')
  const roleDef = layout.roles[role]
  const variations = showPanel ? Object.keys(roleDef.panel_variations) : ['mascot-only']

  $('result-role').textContent = ROLE_LABELS[role] ?? role
  $('result-summary').textContent = showPanel ? 'All three panel styles' : 'Background + mascot banner'
  $('result-empty').classList.add('hidden')
  list.innerHTML = ''

  const cards = variations.map((variation) => {
    const desc = showPanel
      ? roleDef.panel_variations[variation].description
      : 'Background + mascot only'
    const card = document.createElement('article')
    card.className =
      'overflow-hidden rounded-2xl border border-navy/10 bg-page p-3 shadow-sm sm:p-4'
    card.innerHTML = `
      <div class="preview overflow-hidden rounded-xl border border-navy/10 bg-navy-deep">
        <div class="flex aspect-[4/1] items-center justify-center text-sm text-ink-soft">
          Rendering…
        </div>
      </div>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span class="inline-flex items-center rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal-deep">${desc}</span>
        <button type="button" class="download inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-deep">
          Download PNG · 1584×396
        </button>
      </div>`
    list.appendChild(card)
    return { card, variation }
  })

  await Promise.all(
    cards.map(async ({ card, variation }) => {
      const preview = card.querySelector('.preview')
      const btn = card.querySelector('.download')
      try {
        const canvas = await compositeBanner(layout, role, variation, pose, mirror, showPanel, theme)
        preview.replaceChildren(canvas)
        canvas.className = 'block h-auto w-full'
        btn.addEventListener('click', () => {
          const suffix = theme === 'light' ? '-light' : ''
          const name = showPanel
            ? `kongsi-${role}-${variation}${suffix}.png`
            : `kongsi-${role}-mascot-only${suffix}.png`
          download(canvas, name)
        })
      } catch {
        preview.innerHTML =
          '<p class="flex aspect-[4/1] items-center justify-center px-6 text-center text-sm text-orange">Couldn’t render this banner. Try another pose, or reload the page.</p>'
        btn.disabled = true
        btn.classList.add('cursor-not-allowed', 'opacity-50')
        btn.textContent = 'Unavailable'
      }
    }),
  )
}

async function main() {
  try {
    const layout = await fetch(LAYOUT_URL, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`layout.json ${r.status}`)
      return r.json()
    })

    wireRoleChips(layout)
    buildPoseChips(layout)
    buildMirrorToggle(layout)
    buildPanelToggle(layout)
    buildThemeToggle(layout)
    fillSamples(layout)
    syncPanel()
    syncTheme()
  } catch (err) {
    console.error(err)
    $('role-list').innerHTML =
      '<p class="text-sm text-orange">Couldn’t load the banner assets. Reload the page to try again.</p>'
  }
}

main()
