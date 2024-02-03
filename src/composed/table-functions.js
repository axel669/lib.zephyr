export const filters = {
    text: (propName) =>
        (row, text) =>
            row[propName]
                .toLowerCase()
                .includes(text.toLowerCase())
}
export const sorts = {
    natural: (propName) => {
        const comparitor = new Intl.Collator(undefined, { numeric: true })
        return (a, b) => comparitor.compare(a[propName], b[propName])
    }
}
