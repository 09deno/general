import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill'
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'

// Čítačka čiarových kódov funguje aj na iPhone (Safari nemá vlastnú). Jej súbor sa načíta z appky,
// nie z cudzieho servera. Tento modul sa načítava až pri skenovaní, aby appka štartovala rýchlo.
prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasmUrl : prefix + path),
  },
})

export function createDetector() {
  return new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
}
