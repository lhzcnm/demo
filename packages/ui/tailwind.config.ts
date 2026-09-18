import { withTV } from 'tailwind-variants/transformer'
import { preset } from './src/preset'

export default withTV({
  darkMode: 'class',
  presets: [preset],
  content: [
    'src/**/*.{vue,ts}',
    'docs/**/*.vue',
  ],
})
