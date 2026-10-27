/**
 * Up to two initials for an avatar: first + last word of the name, or the
 * first letter of the email when there's no name. "?" if both are empty.
 */
export function initials(name: string, email: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length > 0) {
    const first = Array.from(words[0])[0]
    const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : ""
    return (first + last).toUpperCase()
  }

  const letter = Array.from(email.trim())[0]
  return letter ? letter.toUpperCase() : "?"
}

/** The first word of the name, for greetings. Empty when there's no name. */
export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? ""
}
