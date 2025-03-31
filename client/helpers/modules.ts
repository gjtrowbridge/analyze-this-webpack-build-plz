/**
 * Strip out some parts of the stats.json moduleIdentifier to make it
 * internally consistent.
 *
 * Basically, what I observed is that in the "reasons" section of modules,
 * there would be "reasons" that referenced a moduleIdentifier, but the
 * module itself had that same identifier PLUS some extra crap on the end.
 * This removes that extra crap so we can properly match modules up with their
 * parents and children in (hopefully) almost all cases.
 */
export function getModuleIdentifierKey(moduleIdentifer: string | null) {
  if (moduleIdentifer === null) {
    return '~~null~~'
  }
  const regexToReplace = /\|[a-zA-Z0-9]+$/
  return moduleIdentifer.replace(regexToReplace, '')
}
