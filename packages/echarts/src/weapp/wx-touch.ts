export function wrapTouch(event) {
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i]
    touch.offsetX = touch.x
    touch.offsetY = touch.y
  }
  return event
}

export function touchStart({ chart, event }) {
  if (chart && event.touches.length > 0) {
    const touch = event.touches[0]
    const handler = chart.getZr().handler
    handler.dispatch('mousedown', {
      zrX: touch.x,
      zrY: touch.y,
      preventDefault: () => {},
      stopImmediatePropagation: () => {},
      stopPropagation: () => {},
    })
    handler.dispatch('mousemove', {
      zrX: touch.x,
      zrY: touch.y,
      preventDefault: () => {},
      stopImmediatePropagation: () => {},
      stopPropagation: () => {},
    })
    handler.processGesture(wrapTouch(event), 'start')
  }
}

export function touchMove({ chart, event }) {
  if (chart && event.touches.length > 0) {
    const touch = event.touches[0]
    const handler = chart.getZr().handler
    handler.dispatch('mousedown', {
      zrX: touch.x,
      zrY: touch.y,
      preventDefault: () => {},
      stopImmediatePropagation: () => {},
      stopPropagation: () => {},
    })
    handler.dispatch('mousemove', {
      zrX: touch.x,
      zrY: touch.y,
      preventDefault: () => {},
      stopImmediatePropagation: () => {},
      stopPropagation: () => {},
    })
    handler.processGesture(wrapTouch(event), 'start')
  }
}

export function touchEnd({ chart, event }) {
  if (chart) {
    const touch = event.changedTouches ? event.changedTouches[0] : {}
    const handler = chart.getZr().handler
    handler.dispatch('mouseup', {
      zrX: touch.x,
      zrY: touch.y,
      preventDefault: () => {},
      stopImmediatePropagation: () => {},
      stopPropagation: () => {},
    })
    handler.dispatch('click', {
      zrX: touch.x,
      zrY: touch.y,
      preventDefault: () => {},
      stopImmediatePropagation: () => {},
      stopPropagation: () => {},
    })
    handler.processGesture(wrapTouch(event), 'end')
  }
}
