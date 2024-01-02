export default function pagination(page: string = "0", limit: string = "10") {
    return {
        skip: parseInt(page) * parseInt(limit),
        take: parseInt(limit)
    }
}