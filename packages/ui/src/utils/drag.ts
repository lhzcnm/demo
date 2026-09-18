import type { Directive } from 'vue'

export const vDrag: Directive = {
  mounted(el, binding) {
    if (!binding.value) return

    let offset = { x: 0, y: 0 }
    let draggable = false

    el.style.position = 'fixed'

    el.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.classList.contains('x-dialog-header') && 
        !target.parentElement?.classList.contains('x-dialog-header')) return

      el.classList.add('select-none', 'cursor-move')
      draggable = true

      const rect = el.getBoundingClientRect()
      offset.x = e.clientX - rect.left
      offset.y = e.clientY - rect.top

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })

    function onMouseMove(e: MouseEvent) {
      if (!draggable) return

      let maxX = window.innerWidth - el.offsetWidth
      let maxY = window.innerHeight - el.offsetHeight

      let newx = e.clientX - offset.x
      let newY = e.clientY - offset.y

      let position = { 
        x: Math.max(0, Math.min(maxX, newx)), 
        y: Math.max(0, Math.min(maxY, newY))
      }

      el.style.left = `${position.x}px`
      el.style.top = `${position.y}px`
    }

    function onMouseUp() {
      draggable = false
      el.classList.remove('select-none', 'cursor-move')
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }
}
