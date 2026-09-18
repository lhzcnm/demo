export function isNumber(value: unknown) {
  return typeof value === 'number' && !isNaN(value)
}

export function isNumeric(value: unknown) {
  return typeof value === 'string' && !isNaN(Number(value))
}

export function isString(value: unknown) {
  return typeof value === 'string'
}

export function isNullish(value: unknown) {
  return value === null || value === undefined
}

export function isEmptyValue(val: any) {
  if (isNullish(val)) return true
  if (typeof val === 'string' && val.trim() === '') return true
  return false
}

export function handleFormatPrice(val: string) {
  val = val.replace(/[^\d.]/g, '')
  val = val.replace(/^\./, '')
  val = val.replace(/\.{2,}/g, '.')
  const index = val.indexOf('.')
  if (index !== -1) {
    val =
      val.substring(0, index + 1) +
      val.substring(index + 1).replace(/\./g, '')
  }
  val = val.replace(/^(\d+)(\.\d{0,2}).*$/, '$1$2')

  return val
}

export function handleFormatDecimal(
  val: string,
  precision = 2
) {
  val = val.replace(/[^\d.]/g, '')
  val = val.replace(/^\./, '')

  const firstDot = val.indexOf('.')

  if (firstDot !== -1) {
    val =
      val.substring(0, firstDot + 1) +
      val
        .substring(firstDot + 1)
        .replace(/\./g, '')
  }

  const reg = new RegExp(
    `^(\\d+)(\\.\\d{0,${precision}}).*`
  )

  val = val.replace(reg, '$1$2')

  return val
}

export function handleFormatNumber(val: string) {
  return val
    .replace(/[^\d]/g, '')
}
