import type { Request } from '$lib/types/http'
import { substituteVariables } from './common'

// Applies variable substitution to all string fields of a request
export const applyVariableSubstitution = (request: Request, variables: Map<string, string>): Request => {
    const sub = (text: string) => substituteVariables(text, variables)

    const substituted: Request = {
        ...request,
        url: sub(request.url),
        params: request.params.map(p => ({ ...p, key: sub(p.key), value: sub(p.value) })),
        headers: request.headers.map(h => ({ ...h, key: sub(h.key), value: sub(h.value) })),
        auth: { ...request.auth },
        body: { ...request.body },
    }

    if (substituted.auth.type === 'bearer') {
        substituted.auth = { ...substituted.auth, token: sub(substituted.auth.token) }
    } else if (substituted.auth.type === 'basic') {
        substituted.auth = { ...substituted.auth, username: sub(substituted.auth.username), password: sub(substituted.auth.password) }
    } else if (substituted.auth.type === 'api-key') {
        substituted.auth = { ...substituted.auth, key: sub(substituted.auth.key), value: sub(substituted.auth.value) }
    }

    if (substituted.body.type === 'json' || substituted.body.type === 'text') {
        substituted.body = { ...substituted.body, content: sub(substituted.body.content) }
    } else if (substituted.body.type === 'form-data' || substituted.body.type === 'x-www-form-urlencoded') {
        substituted.body = { ...substituted.body, data: substituted.body.data.map(d => ({ ...d, key: sub(d.key), value: sub(d.value) })) }
    }

    return substituted
}
