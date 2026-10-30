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
}

const POSE_LABELS = {
  welcome: 'Welcome',
  celebrate: 'Celebrate',
  'climb-higher': 'Climb Higher',
  'carry-parcel': 'Carry Parcel',
}

const state = { role: null, pose: null, mirror: false }

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

async function compositeBanner(layout, role, variation, pose, mirror) {
  const roleDef = layout.roles[role]
  const varDef = roleDef.panel_variations[variation]
  const placement = layout.mascot_poses[pose].banner_placement

  const canvas = document.createElement('canvas')
  canvas.width = layout.canvas.width
  canvas.height = layout.canvas.height
  const ctx = canvas.getContext('2d')

  const bg = await loadImage(`/assets/${layout.background.file}`)
  ctx.drawImage(bg, 0, 0)

  const panel = await loadImage(`/assets/${varDef.file}`)
  ctx.drawImage(panel, varDef.place_at.x, varDef.place_at.y)

  const mascotSrc = `/assets/mascot/${pose}/koko-${pose}-md${mirror ? '-mirror' : ''}.png`
  const mascot = await loadImage(mascotSrc)
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 6
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
  for (const btn of $('role-list').children) {
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

  for (const btn of $('role-list').children) {
    const active = btn.dataset.role === role
    btn.className = chipClass(active)
    btn.setAttribute('aria-pressed', String(active))
  }

  const generate = $('generate-btn')
  generate.disabled = false
  $('generate-hint').textContent = `${ROLE_LABELS[role] ?? role} selected — hit Generate banner.`

  syncPoseChips(layout)
  syncMirror()
  prefetchRoleAssets(layout, role)
  $('result').classList.add('hidden')
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

function buildMirrorToggle(layout) {
  $('mirror-toggle').addEventListener('click', () => {
    state.mirror = !state.mirror
    syncMirror()
    renderBanners(layout)
  })
}

function fillSamples(layout) {
  for (const fig of document.querySelectorAll('#samples figure')) {
    const { role, variant } = fig.dataset
    fig.querySelector('[data-sample-role]').textContent = ROLE_LABELS[role] ?? role
    fig.querySelector('[data-sample-desc]').textContent =
      layout.roles[role]?.panel_variations[variant]?.description ?? ''
  }
}

async function renderBanners(layout) {
  const role = state.role
  const pose = state.pose
  const mirror = state.mirror
  if (!role) return

  const list = $('banner-list')
  const roleDef = layout.roles[role]
  const variations = Object.keys(roleDef.panel_variations)

  $('result-role').textContent = ROLE_LABELS[role] ?? role
  list.innerHTML = ''

  const cards = variations.map((variation) => {
    const desc = roleDef.panel_variations[variation].description
    const card = document.createElement('article')
    card.className =
      'overflow-hidden rounded-2xl border border-navy/10 bg-page p-3 shadow-sm sm:p-4'
    card.innerHTML = `
      <div class="preview overflow-hidden rounded-xl border border-navy/10 bg-navy-deep">
        <div class="flex aspect-[4/1] items-center justify-center text-sm text-ink-soft">
          Rendering…
        </div>
      </div>
      <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-ink-soft">${desc}</p>
        <button type="button" class="download inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-deep">
          Download PNG
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
        const canvas = await compositeBanner(layout, role, variation, pose, mirror)
        preview.replaceChildren(canvas)
        canvas.className = 'block h-auto w-full'
        btn.addEventListener('click', () => {
          download(canvas, `kongsi-${role}-${variation}.png`)
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
    const layout = await fetch(LAYOUT_URL).then((r) => {
      if (!r.ok) throw new Error(`layout.json ${r.status}`)
      return r.json()
    })

    wireRoleChips(layout)
    buildPoseChips(layout)
    buildMirrorToggle(layout)
    fillSamples(layout)

    $('generate-btn').addEventListener('click', () => {
      if (!state.role) return
      const result = $('result')
      result.classList.remove('hidden')
      result.focus({ preventScroll: true })
      renderBanners(layout)
    })
  } catch (err) {
    console.error(err)
    $('role-list').innerHTML =
      '<p class="text-sm text-orange">Couldn’t load the banner assets. Reload the page to try again.</p>'
    $('generate-hint').textContent = 'Banners are unavailable until the assets load.'
  }
}

main()
