import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { closeDatabase, pool } from './pool.js'

const sqlFile = process.argv[2]
if (!sqlFile) throw new Error('Chemin SQL manquant.')

const absolutePath = resolve(process.cwd(), sqlFile)
const sql = await readFile(absolutePath, 'utf8')

try {
  await pool.query(sql)
  console.log(`SQL exécuté : ${absolutePath}`)
} finally {
  await closeDatabase()
}
