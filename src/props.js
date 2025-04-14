export const filterProps = (props, filter) => Object.entries(props).reduce(
    (p, [name, value]) => {
        if (name.startsWith(filter) === true) {
            p[name.slice(filter.length)] = value
        }
        return p
    },
    {}
)

export const splitProps = (props, ...splits) => Object.entries(props).reduce(
    (groups, [name, value]) => {
        for (const split of splits) {
            if (name.startsWith(split) === true) {
                groups[split] = groups[split] ?? {}
                groups[split][name.slice(split.length)] = value
                return groups
            }
        }
        groups.rest[name] = value
        return groups
    },
    { rest: {} }
)
