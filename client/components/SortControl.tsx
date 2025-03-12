
export function SortControl<SortBy = string>(args: {
  controlFor: SortBy
  sortBy: SortBy
  setSortBy: (sortBy: SortBy) => void
  sortAscending: boolean
  setSortAscending: (sortAscending: boolean) => void
}) {
  const {
    controlFor,
    sortBy,
    setSortBy,
    sortAscending,
    setSortAscending,
  } = args

  const alreadySortingByThis = controlFor === sortBy

  const style = {
    fontWeight: alreadySortingByThis ? 500 : 300,
  }
  const onClick = () => {
    if (alreadySortingByThis) {
      setSortAscending(!sortAscending)
    }
    setSortBy(controlFor)
  }
  let text: string = String(controlFor)
  if (alreadySortingByThis) {
    text = `${text} (${sortAscending ? "asc" : "dsc"})`
  }
  const classNames = ["sortControl"]
  if (alreadySortingByThis) {
    classNames.push("active")
  }

  return (
    <button className={classNames.join(" ")} onClick={onClick}>
      {text}
    </button>
  )
}