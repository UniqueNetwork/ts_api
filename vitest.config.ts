import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 60000,
    hookTimeout: 3600 * 1000,
  },
})
