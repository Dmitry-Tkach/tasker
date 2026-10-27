import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { initials } from "../_lib/initials"

interface WorkspaceAvatarProps extends Omit<React.ComponentProps<typeof Avatar>, "children"> {
  name: string
  imageUrl: string | null
}

/** The workspace image as a rounded square, or the name's initials. Decorative. */
export function WorkspaceAvatar({ name, imageUrl, className, ...props }: WorkspaceAvatarProps) {
  return (
    <Avatar aria-hidden="true" className={cn("rounded-md after:rounded-md", className)} {...props}>
      {imageUrl ? <AvatarImage src={imageUrl} alt="" className="rounded-md" /> : null}
      <AvatarFallback className="rounded-md bg-blue-600 text-xs font-semibold text-white dark:bg-blue-500">
        {initials(name, "")}
      </AvatarFallback>
    </Avatar>
  )
}
